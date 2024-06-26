/**
 * External dependencies
 */
import wpcomProxyRequest from 'wpcom-proxy-request';
/**
 * Types
 */
import type { CheckMediaProps } from '../../types';

export async function mediaExists( { siteId, mediaId }: CheckMediaProps ): Promise< boolean > {
	const id = Number( mediaId );

	if ( Number.isNaN( id ) ) {
		return false;
	}

	try {
		// Using wpcomProxyRequest directly here because we don't want to limit the number of concurrent media checks
		// We store at most 10 logos in the local storage, so the number of concurrent requests should be limited
		await wpcomProxyRequest( {
			path: `/sites/${ String( siteId ) }/media/${ Number( mediaId ) }`,
			apiVersion: '1.1',
			method: 'GET',
		} );

		return true;
	} catch ( error ) {
		const status = ( error as { status?: number } )?.status;

		if ( status === 404 ) {
			return false;
		}

		throw error;
	}
}
