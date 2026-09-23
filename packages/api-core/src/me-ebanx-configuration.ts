import { wpcom } from './wpcom-fetcher';

/**
 * Everything needed to load and configure the EBANX SDK for one request.
 */
export interface EbanxConfiguration {
	js_url: string;
	environment: string;
	public_key: string;
}

/**
 * @param requestType What the token will be used for, e.g. `new_purchase` or `add_card`.
 */
export async function fetchEbanxConfiguration(
	requestType: string
): Promise< EbanxConfiguration > {
	return await wpcom.req.get( '/me/ebanx-configuration', { request_type: requestType } );
}
