import { useCallback, useState } from 'react';
import type {
	MessageActionsRegistration,
	UseMessageActionsReturn,
} from '../react/useAgentChat';
import { createFeedbackActions } from './factories';

/**
 * Hook for managing message actions registrations
 * Provides methods to register, unregister, and create message actions
 */
export function useMessageActions(): UseMessageActionsReturn & {
	registrations: MessageActionsRegistration[];
} {
	// State to store all registered message action sets
	const [ registrations, setRegistrations ] = useState<
		MessageActionsRegistration[]
	>( [] );

	// Register a new set of message actions or update existing one
	const registerMessageActions = useCallback(
		( registration: MessageActionsRegistration ) => {
			setRegistrations( ( prev ) => {
				// Check if registration with this ID already exists
				const existingIndex = prev.findIndex(
					( r ) => r.id === registration.id
				);

				if ( existingIndex >= 0 ) {
					// Replace existing registration
					const updated = [ ...prev ];
					updated[ existingIndex ] = registration;
					return updated;
				}

				return [ ...prev, registration ];
			} );
		},
		[]
	);

	const unregisterMessageActions = useCallback( ( id: string ) => {
		setRegistrations( ( prev ) => prev.filter( ( r ) => r.id !== id ) );
	}, [] );

	const clearAllMessageActions = useCallback( () => {
		setRegistrations( [] );
	}, [] );

	return {
		registerMessageActions,
		unregisterMessageActions,
		clearAllMessageActions,
		createFeedbackActions,
		registrations,
	};
}
