import { useMemo } from 'react';
import { logger } from '../client/utils/logger';
import type { ClientContext, ContextProvider } from '../client/types/index';

/**
 * Callback function type for getting client context
 */
export type GetClientContextCallback = () => ClientContext;

/**
 * Hook for creating a context provider from a user-provided callback
 *
 * This hook abstracts the ContextProvider interface and allows users to simply
 * provide a callback function that returns fresh context data each time a message
 * is sent to the agent.
 *
 * @param getClientContextCallback - Function that returns fresh client context data
 * @return ContextProvider instance or undefined if no callback provided
 */
export function useClientContext(
	getClientContextCallback?: GetClientContextCallback
): ContextProvider | undefined {
	const contextProvider = useMemo( () => {
		if ( ! getClientContextCallback ) {
			return undefined;
		}

		// Create a ContextProvider that wraps the user's callback
		const provider: ContextProvider = {
			getClientContext: () => {
				try {
					// Call the user's callback to get fresh context data
					const context = getClientContextCallback();

					// Ensure we return a valid object
					return context || {};
				} catch ( error ) {
					// Log error but don't break the message sending
					logger( 'Error getting client context: %O', error );
					return {};
				}
			},
		};

		return provider;
	}, [ getClientContextCallback ] );

	return contextProvider;
}
