/**
 * Calypso Authentication Provider for Agenttic Client
 *
 * Provides authentication for Calypso using WPCOM OAuth tokens
 */

import * as oauthToken from '@automattic/oauth-token';
import type { AuthProvider } from '@automattic/agenttic-client';

export interface CalypsoAuthError {
	code?: string;
	status?: number;
	message?: string;
}

/**
 * Error handler function type for Calypso authentication errors
 */
export type CalypsoErrorHandler = ( error: CalypsoAuthError ) => string;

/**
 * Create a Calypso authentication provider for use with Agenttic client.
 *
 * Uses OAuth token from Calypso's @automattic/oauth-token package.
 * The token is added to the Authorization header as a Bearer token,
 * matching the pattern used by wpcom-xhr-request.
 *
 * @returns Authentication provider function that returns headers
 */
export const createCalypsoAuthProvider = (): AuthProvider => {
	return async () => {
		const headers: Record< string, string > = {
			'Content-Type': 'application/json',
		};

		// Get OAuth token from Calypso's oauth-token package
		// This retrieves the token from wpcom_token cookie or localStorage
		const token = oauthToken.getToken();

		if ( token ) {
			// Add Authorization header with Bearer token
			// This matches the pattern used by wpcom-xhr-request
			headers.Authorization = `Bearer ${ token }`;
		} else {
			// eslint-disable-next-line no-console
			console.warn( '[CalypsoAuthProvider] No OAuth token available' );
		}

		return headers;
	};
};

/**
 * Default error handler for Calypso authentication failures
 * @param error - The authentication error
 * @returns User-friendly error message
 */
export const defaultCalypsoErrorHandler = ( error: CalypsoAuthError ): string => {
	if ( error?.code === 'rest_forbidden' || error?.status === 403 ) {
		return "You don't have permission to access AI features.";
	}

	if ( error?.code === 'rest_no_route' || error?.status === 404 ) {
		return 'AI service is not available. Please try again later.';
	}

	if (
		error?.message?.includes( 'network' ) ||
		error?.message?.includes( 'Network' ) ||
		error?.message?.includes( 'fetch' )
	) {
		return 'Network connection issue. Please check your internet connection and try again.';
	}

	if ( error?.status === 401 ) {
		return 'Your session expired. Please refresh the page and try again.';
	}

	return 'Unable to connect to AI service. Please try again.';
};
