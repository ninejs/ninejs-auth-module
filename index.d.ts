export { default as Auth } from './Auth';
export interface AuthConfig {
    routePrefix?: string;
    loginRoute?: string;
    logoutRoute?: string;
    usersRoute?: string;
    permissionsRoute?: string;
    clientPrefix?: string;
}
