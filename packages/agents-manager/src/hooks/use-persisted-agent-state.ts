/**
 * Hook for persisting AI agent state to /me/preferences API
 * Persists session ID, open/closed state, and dock/undock state
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Agent state that gets persisted
 */
export interface PersistedAgentState {
	sessionId?: string;
	isOpen?: boolean;
	isDocked?: boolean;
	lastUpdated?: number;
}

export interface UsePersistedAgentStateOptions {
	/**
	 * Preference key to use for storage
	 * @default 'agents-manager-state'
	 */
	preferenceKey?: string;
	/**
	 * Function to save preferences to server
	 * Should accept the preference key and value
	 */
	savePreference?: ( key: string, value: PersistedAgentState ) => Promise< void >;
	/**
	 * Function to load preferences from server
	 * Should return the persisted state or null
	 */
	loadPreference?: ( key: string ) => Promise< PersistedAgentState | null >;
	/**
	 * Debounce delay for saving preferences (ms)
	 * @default 1000
	 */
	debounceMs?: number;
}

export interface UsePersistedAgentStateResult {
	/**
	 * Current persisted state
	 */
	state: PersistedAgentState;
	/**
	 * Update session ID
	 */
	setSessionId: ( sessionId: string ) => void;
	/**
	 * Update open/closed state
	 */
	setIsOpen: ( isOpen: boolean ) => void;
	/**
	 * Update dock/undock state
	 */
	setIsDocked: ( isDocked: boolean ) => void;
	/**
	 * Update multiple state fields at once
	 */
	updateState: ( partial: Partial< PersistedAgentState > ) => void;
	/**
	 * Whether state is currently being loaded
	 */
	isLoading: boolean;
}

/**
 * Default save function using wpcom-proxy-request or apiFetch
 */
const defaultSavePreference = async (
	key: string,
	value: PersistedAgentState
): Promise< void > => {
	// Try to use wpcom API if available
	if ( typeof window !== 'undefined' && ( window as any ).wpcomRequest ) {
		const wpcomRequest = ( window as any ).wpcomRequest;
		try {
			await wpcomRequest( {
				path: '/me/preferences',
				apiNamespace: 'wpcom/v2',
				method: 'PUT',
				body: {
					calypso_preferences: {
						[ key ]: value,
					},
				},
			} );
			return;
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( '[usePersistedAgentState] Failed to save to wpcom:', error );
		}
	}

	// Fallback to WordPress apiFetch if available
	if ( typeof window !== 'undefined' && ( window as any ).wp?.apiFetch ) {
		const apiFetch = ( window as any ).wp.apiFetch;
		try {
			await apiFetch( {
				path: '/ai-agent/state',
				method: 'PUT',
				data: { [ key ]: value },
			} );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( '[usePersistedAgentState] Failed to save via apiFetch:', error );
		}
	}
};

/**
 * Default load function
 */
const defaultLoadPreference = async ( key: string ): Promise< PersistedAgentState | null > => {
	// Try to use wpcom API if available
	if ( typeof window !== 'undefined' && ( window as any ).wpcomRequest ) {
		const wpcomRequest = ( window as any ).wpcomRequest;
		try {
			const response = await wpcomRequest( {
				path: '/me/preferences',
				apiNamespace: 'wpcom/v2',
				method: 'GET',
			} );
			return response?.calypso_preferences?.[ key ] || null;
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( '[usePersistedAgentState] Failed to load from wpcom:', error );
		}
	}

	return null;
};

/**
 * Hook for managing persisted agent state
 * @param {UsePersistedAgentStateOptions} options - Configuration options
 */
export function usePersistedAgentState(
	options: UsePersistedAgentStateOptions = {}
): UsePersistedAgentStateResult {
	const {
		preferenceKey = 'agents-manager-state',
		savePreference = defaultSavePreference,
		loadPreference = defaultLoadPreference,
		debounceMs = 1000,
	} = options;

	// The default dock state is `false` and default open state is `false`
	const [ state, setState ] = useState< PersistedAgentState >( {
		isDocked: false,
		isOpen: false,
	} );
	const [ isLoading, setIsLoading ] = useState( true );
	const saveTimeoutRef = useRef< number | null >( null );

	// Load initial state from preferences
	useEffect( () => {
		let cancelled = false;

		const loadState = async () => {
			try {
				const loaded = await loadPreference( preferenceKey );
				if ( ! cancelled && loaded ) {
					setState( loaded );
				}
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( '[usePersistedAgentState] Failed to load state:', error );
			} finally {
				if ( ! cancelled ) {
					setIsLoading( false );
				}
			}
		};

		loadState();

		return () => {
			cancelled = true;
		};
	}, [ preferenceKey, loadPreference ] );

	// Debounced save function
	const debouncedSave = useCallback(
		( newState: PersistedAgentState ) => {
			if ( saveTimeoutRef.current !== null ) {
				clearTimeout( saveTimeoutRef.current );
			}

			const timeout = window.setTimeout( () => {
				savePreference( preferenceKey, {
					...newState,
					lastUpdated: Date.now(),
				} ).catch( ( error ) => {
					// eslint-disable-next-line no-console
					console.error( '[usePersistedAgentState] Save failed:', error );
				} );
			}, debounceMs );

			saveTimeoutRef.current = timeout;
		},
		[ preferenceKey, savePreference, debounceMs ]
	);

	// Update functions
	const setSessionId = useCallback(
		( sessionId: string ) => {
			setState( ( prev ) => {
				const newState = { ...prev, sessionId };
				debouncedSave( newState );
				return newState;
			} );
		},
		[ debouncedSave ]
	);

	const setIsOpen = useCallback(
		( isOpen: boolean ) => {
			setState( ( prev ) => {
				const newState = { ...prev, isOpen };
				debouncedSave( newState );
				return newState;
			} );
		},
		[ debouncedSave ]
	);

	const setIsDocked = useCallback(
		( isDocked: boolean ) => {
			setState( ( prev ) => {
				const newState = { ...prev, isDocked };
				debouncedSave( newState );
				return newState;
			} );
		},
		[ debouncedSave ]
	);

	const updateState = useCallback(
		( partial: Partial< PersistedAgentState > ) => {
			setState( ( prev ) => {
				const newState = { ...prev, ...partial };
				debouncedSave( newState );
				return newState;
			} );
		},
		[ debouncedSave ]
	);

	// Cleanup timeout on unmount
	useEffect(
		() => () => {
			if ( saveTimeoutRef.current !== null ) {
				clearTimeout( saveTimeoutRef.current );
			}
		},
		[]
	);

	return {
		state,
		setSessionId,
		setIsOpen,
		setIsDocked,
		updateState,
		isLoading,
	};
}
