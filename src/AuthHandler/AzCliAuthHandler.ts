import exec = require('@actions/exec');
import io = require('@actions/io');

import { IAuthorizationHandler } from "./IAuthorizationHandler";

var azAccountDetails, azCloudDetails, azPath;

export class AzCliAuthHandler implements IAuthorizationHandler{
    private static endpoint: AzCliAuthHandler;
    private _subscriptionID: string = '';
    private _baseUrl: string = 'https://management.azure.com/';
    private _token: string = '';

    private constructor() {
        this._subscriptionID = !!azAccountDetails && azAccountDetails['id'];
        this._baseUrl = !!azCloudDetails && azCloudDetails['endpoints']['resourceManager'];
    }

    public static getEndpoint(param?: string) {
        if(!this.endpoint) {            
            this.endpoint = new AzCliAuthHandler();
        }
        return this.endpoint;
    }

    public get subscriptionID(): string {
        return this._subscriptionID;
    }

    public get baseUrl(): string {
        return this._baseUrl;
    }

    public async getToken(args?: string[], force?: boolean) {
        if(!this._token || force) {  
            try {
                let azAccessToken = JSON.parse(await executeAzCliCommand('account get-access-token', !!args ? args : []));
                this._token = azAccessToken['accessToken'];
            }
            catch(error) {
                console.log('Failed to fetch Azure access token');
                throw error;
            }          
        }
        return this._token;
    }
}

export async function initialize() {  
    azPath = await io.which("az", true);  
    azAccountDetails = JSON.parse(await executeAzCliCommand('account show'));
    azCloudDetails = JSON.parse(await executeAzCliCommand('cloud show'));
}

async function executeAzCliCommand(command: string, args?: string[]): Promise<string> {
    let stdout = '';
   
    let code = await exec.exec(`"${azPath}" ${command}`, args, {
        silent: true,
        listeners: {
            stdout: (data: Buffer) => {
                stdout += data.toString();
            }
        }
    }); 

    if(code != 0) {
        throw new Error('Failed to fetch Azure access token');
    }

    return stdout;
}