export interface IAuthorizationHandler {
    getToken(args?: string[], force?: boolean);
    subscriptionID: string;
    baseUrl: string;
}