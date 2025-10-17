import { wpcom } from '../wpcom-fetcher';
import { AccountClosureResponse } from './types';

/**
 * Closes the current user's account
 * @returns Promise<AccountClosureResponse>
 */
export async function closeAccount(): Promise< AccountClosureResponse > {
	return wpcom.req.post( {
		path: '/me/account/close',
		apiVersion: '1.1',
		body: {}, // Empty body required by wpcom-http
	} );
}

/**
 * Restores a closed account using a restoration token
 * @param token - The restoration token received when account was closed
 * @returns Promise<void>
 */
export async function restoreAccount( token: string ): Promise< void > {
	return wpcom.req.post( {
		path: '/me/account/restore',
		apiVersion: '1.1',
		body: { token },
	} );
}
