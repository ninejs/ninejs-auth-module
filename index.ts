export { default as Auth } from './Auth'

export interface AuthConfig {
    /*
    default: ''
     */
    routePrefix?: string;

    /*
    default: '/service/login'
     */
    loginRoute?: string;

    /*
    default: '/service/logout'
     */
    logoutRoute?: string;

    /*
    default: '/service/auth/users'
     */
    usersRoute?: string;

    /*
    default: '/service/auth/permissions'
     */
    permissionsRoute?: string;

    /*
    default: ''
    Normally not needed
     */
    clientPrefix?: string;
}