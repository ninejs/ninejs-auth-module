var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "ninejs/core/ext/Evented", "ninejs/core/deferredUtils", "ninejs/core/objUtils", "path"], factory);
    }
})(function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    const Evented_1 = require("ninejs/core/ext/Evented");
    const deferredUtils_1 = require("ninejs/core/deferredUtils");
    const objUtils_1 = require("ninejs/core/objUtils");
    const path = require("path");
    class Auth {
        on() {
            return Evented_1.default.on.apply(this, arguments);
        }
        emit(type, data) {
            return Evented_1.default.emit.apply(this, arguments);
        }
        login(username, password, domain, callback) {
            let dom;
            if ((typeof (domain) === 'function') && !callback) {
                callback = domain;
                dom = null;
            }
            else {
                dom = domain;
            }
            return deferredUtils_1.when(this.impl.login(username, password, dom), function (data) {
                if (callback) {
                    callback(data);
                }
                return data;
            });
        }
        usersByPermission(permissions) {
            return this.impl.usersByPermission(permissions);
        }
        users() {
            return this.impl.users();
        }
        permissions() {
            return this.impl.permissions();
        }
        getUser(username) {
            return this.impl.getUser(username);
        }
        constructor(config, ninejs, webserver, impl) {
            this.config = config;
            this.impl = impl;
            var server = webserver, Endpoint = server.Endpoint, self = this;
            server.clientSetup(function (utils) {
                utils.addAmdPath('ninejs-auth-module/client', path.resolve(__dirname, 'client'));
                utils.addModule('ninejs-auth-module/client/module', {
                    'ninejs/auth': {
                        loginUrl: '/service/login',
                        logoutUrl: '/service/logout'
                    }
                });
            });
            server.add(new Endpoint({
                route: '/service/login', method: 'get', handler: function (req, res) {
                    var session = req.session, result;
                    res.set('Content-Type', 'application/json');
                    if (session.username) {
                        deferredUtils_1.when(self.impl.getUser(session.username), function (data) {
                            if (data) {
                                result = {
                                    result: 'success',
                                    id: data.username
                                };
                                for (var p in data) {
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
                route: '/service/login', method: 'post', handler: function (req, res) {
                    res.set('Content-Type', 'application/json');
                    deferredUtils_1.when(self.login(req.body.user, req.body.password, req.body.domain, function (data) {
                        var session = req.session;
                        if (data.result === 'success') {
                            session.username = req.body.user;
                        }
                        else {
                            session.username = null;
                        }
                        return data;
                    }), function (data) {
                        self.emit('login', data);
                        res.end(JSON.stringify(data));
                    });
                }
            }));
            server.add(new Endpoint({
                route: '/service/logout', method: 'get', handler: function (req, res) {
                    var session = req.session, result;
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
                route: '/service/auth/users', method: 'get', handler: function (req, res) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (req.query.byPermissions) {
                            var permissions = JSON.parse('\"' + req.query.byPermissions + '\"');
                            if (!objUtils_1.isArray(permissions)) {
                                permissions = [permissions];
                            }
                            var users = yield self.usersByPermission(permissions);
                            res.end(JSON.stringify(users));
                        }
                        else {
                            var users = yield self.users();
                            res.end(JSON.stringify(users));
                        }
                    });
                }
            }));
            server.add(new Endpoint({
                route: '/service/auth/permissions', method: 'get', handler: function (req, res) {
                    return __awaiter(this, void 0, void 0, function* () {
                        var permissions = yield self.permissions();
                        res.end(JSON.stringify(permissions));
                    });
                }
            }));
        }
    }
    exports.default = Auth;
});
//# sourceMappingURL=Auth.js.map