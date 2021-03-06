'use strict';

import Evented from 'ninejs/core/ext/Evented'
import { when } from 'ninejs/core/deferredUtils'
import { isArray } from 'ninejs/core/objUtils'
import { NineJs } from 'ninejs/modules/ninejs-server'
import { default as WebServer, Request, Response } from 'ninejs/modules/webserver/WebServer'
import ClientUtils from 'ninejs/modules/webserver/ClientUtils'
import path = require('path')
import {AuthConfig} from "./index";

export interface Result {
	result: string;
}
export interface LoginResult extends Result {
	id?: string;
	[ name: string ]: any;
}
export interface AuthImpl {
	login (username: string, password: string, domain?: any, callback?: (data: any) => void): Promise<any>;
	usersByPermission (permissions: string[]): Promise<any>;
	users (): Promise<any>;
	permissions (): Promise<any>;
	getUser (username: string) : Promise<any>;
}

class Auth implements AuthImpl {
	on () {
		return Evented.on.apply(this, arguments);
	}
	emit (type: string, data: any) {
		return Evented.emit.apply(this, arguments);
	}
	config: AuthConfig;
	impl: AuthImpl;
	login (username: string, password: string, domain?: any, callback?: (data: any) => void) {
		let dom: string;
		if ((typeof(domain) === 'function') && !callback) {
			callback = domain;
			dom = null;
		}
		else {
			dom = domain as string;
		}
		return when(this.impl.login(username, password, dom), function (data) {
			if (callback) {
				callback(data);
			}
			return data;
		});
	}
	usersByPermission (permissions: string[]) {
		return this.impl.usersByPermission(permissions);
	}
	users () {
		return this.impl.users();
	}
	permissions () {
		return this.impl.permissions();
	}
	getUser (username: string) {
		return this.impl.getUser(username);
	}
	constructor (config: any, ninejs: NineJs, webserver: WebServer, impl: AuthImpl) {
		this.config = config;
		this.impl = impl;
		let server = webserver,
			Endpoint = server.Endpoint,
			self = this,
			clientPrefix = this.config.clientPrefix || '',
			routePrefix = this.config.routePrefix || '',
			loginRoute = this.config.loginRoute || '/service/login',
			logoutRoute = this.config.logoutRoute || 'service/logout',
			usersRoute = this.config.usersRoute || '/service/auth/users',
			permissionsRoute = this.config.permissionsRoute || '/service/auth/permissions';

		server.clientSetup(function (utils: ClientUtils) {
			utils.addAmdPath('ninejs-auth-module/client', path.resolve(__dirname, 'client'));
			utils.addModule('ninejs-auth-module/client/module', {
				'ninejs/auth': {
					loginUrl: clientPrefix + routePrefix + loginRoute,
					logoutUrl: clientPrefix + routePrefix + logoutRoute
				}
			});
		});
		server.add(new Endpoint({
			route: routePrefix + loginRoute, method: 'get', handler: function (req: Request, res: Response) {
				let session = req.session,
					result: LoginResult;
				res.set('Content-Type', 'application/json');
				if (session.username) {
					when(self.impl.getUser(session.username), function (data) {
						if (data) {
							result = {
								result: 'success',
								id: data.username
							};
							for (let p in data) {
								if ((p !== 'password') && data.hasOwnProperty(p)) {
									result[p] = data[p];
								}
							}
						}
						else {
							result = {
								result: 'failed'
							};
						}
						res.end(JSON.stringify(result));
					}, function (err) {
						console.error(err);
					});
				}
				else {
					result = {
						result: 'failed'
					};
					res.end(JSON.stringify(result));
				}
			}
		}));
		server.add(new Endpoint({
			route: routePrefix + loginRoute, method: 'post', handler: async function (req: Request, res: Response) {
				res.set('Content-Type', 'application/json');

				let data = await self.login(req.body.user, req.body.password, req.body.domain);
				let session = req.session;
				if (data.result === 'success') {
					session.username = req.body.user;
				}
				else {
					session.username = null;
				}

				self.emit('login', data);
				res.end(JSON.stringify(data));
			}
		}));
		server.add(new Endpoint({
			route: routePrefix + logoutRoute, method: 'get', handler: function (req: Request, res: Response) {
				let session = req.session,
					result: Result;
				res.set('Content-Type', 'application/json');
				if (session) {
					req.session.destroy();
					req.session = null;
				}
				result = {
					result: 'success'
				};
				self.emit('logout', result);
				res.end(JSON.stringify(result));
			}
		}));
		server.add(new Endpoint({
			route: routePrefix + usersRoute, method: 'get', handler: async function (req: Request, res: Response) {
				if (req.query.byPermissions) {
					let permissions = JSON.parse('\"' + req.query.byPermissions + '\"');
					if (!isArray(permissions)) {
						permissions = [permissions];
					}
					let users = await self.usersByPermission(permissions);
					res.end(JSON.stringify(users));
				}
				else {
					let users = await self.users();
					res.end(JSON.stringify(users));
				}
			}
		}));
		server.add(new Endpoint({
			route: routePrefix + permissionsRoute, method: 'get', handler: async function (req: Request, res: Response) {
				let permissions = await self.permissions();
				res.end(JSON.stringify(permissions));
			}
		}));
	}
}

export default Auth