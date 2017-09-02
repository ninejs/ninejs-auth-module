import { NineJs } from 'ninejs/modules/ninejs-server';
import { default as WebServer } from 'ninejs/modules/webserver/WebServer';
import { AuthConfig } from "./index";
export interface Result {
    result: string;
}
export interface LoginResult extends Result {
    id?: string;
    [name: string]: any;
}
export interface AuthImpl {
    login(username: string, password: string, domain?: any, callback?: (data: any) => void): Promise<any>;
    usersByPermission(permissions: string[]): Promise<any>;
    users(): Promise<any>;
    permissions(): Promise<any>;
    getUser(username: string): Promise<any>;
}
declare class Auth implements AuthImpl {
    on(): any;
    emit(type: string, data: any): any;
    config: AuthConfig;
    impl: AuthImpl;
    login(username: string, password: string, domain?: any, callback?: (data: any) => void): Promise<any>;
    usersByPermission(permissions: string[]): Promise<any>;
    users(): Promise<any>;
    permissions(): Promise<any>;
    getUser(username: string): Promise<any>;
    constructor(config: any, ninejs: NineJs, webserver: WebServer, impl: AuthImpl);
}
export default Auth;
