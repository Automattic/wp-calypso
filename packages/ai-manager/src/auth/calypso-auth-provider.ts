/**
 * Calypso Authentication Provider for Agenttic Client
 *
 * Provides authentication for Calypso using JWT tokens via wpcomRequest
 */

/**
 * External dependencies
 */
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { AuthProvider } from '@automattic/agenttic-client';

/**
 * Create a Calypso authentication provider for use with Agenttic client.
 *
 * Uses wpcomRequest to fetch JWT tokens for authentication.
 * This works in Calypso by proxying through the Calypso server to public-api.wordpress.com.
 * @param siteId - Site ID for fetching JWT tokens
 * @returns Authentication provider function that returns headers
 */
export const createCalypsoAuthProvider = ( siteId?: string | number ): AuthProvider => {
	return async (): Promise< Record< string, string > > => {
		const headers: Record< string, string > = {};

		if ( ! siteId ) {
			throw new Error( 'No site ID available for authentication' );
		}

		if ( ! canAccessWpcomApis() ) {
			throw new Error( 'You cannot access this feature' );
		}

		try {
			const data = ( await wpcomRequest( {
				path: `/sites/${ siteId }/jetpack-openai-query/jwt`,
				apiNamespace: 'wpcom/v2',
				method: 'POST',
			} ) ) as { token?: string; jwt?: string };

			const token = data?.token || data?.jwt;

			if ( ! token ) {
				throw new Error( 'No token returned from response' );
			}

			headers.Authorization = `Bearer ${ token }`;
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to get JWT token:', error );
			throw error;
		}

		return headers;
	};
};
