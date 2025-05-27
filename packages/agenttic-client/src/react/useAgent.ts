import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { createA2AClient } from '../client/index';
import { createTextMessage } from '../utils/index';
import { defaultDispatcher } from '../utils/dispatcher';
import type {
	A2AClient,
	A2AClientConfig,
	Message,
	SendMessageParams,
	Task,
	TaskUpdate,
} from '../types/index';

/**
 * Configuration for the useAgent hook
 */
export interface UseAgentConfig extends Omit< A2AClientConfig, 'dispatcher' > {
	// Browser-specific config options can be added here
}

/**
 * State for the agent hook
 */
export interface AgentState {
	isConnected: boolean;
	isLoading: boolean;
	error: string | null;
	lastResponse: Task | null;
}

/**
 * Return type for the useAgent hook
 */
export interface UseAgentReturn {
	// State
	state: AgentState;

	// Actions
	sendMessage: (
		message: string,
		options?: Partial< SendMessageParams >
	) => Promise< Task >;
	sendMessageStream: (
		message: string,
		options?: Partial< SendMessageParams >
	) => AsyncIterable< TaskUpdate >;

	// Utilities
	clearError: () => void;
	reset: () => void;
}

/**
 * React hook for managing A2A client connections and message sending
 *
 * @param config - Configuration for the A2A client
 * @return Object containing state and actions for agent interaction
 */
export function useAgent( config: UseAgentConfig ): UseAgentReturn {
	// Initialize client once on mount
	const clientRef = useRef< A2AClient | null >( null );
	const [ initError, setInitError ] = useState< string | null >( null );

	// Initialize client only once
	if ( ! clientRef.current && ! initError ) {
		try {
			clientRef.current = createA2AClient( {
				...config,
				dispatcher: defaultDispatcher, // Always use browser dispatcher
			} );
		} catch ( error ) {
			setInitError(
				error instanceof Error
					? error.message
					: 'Failed to initialize client'
			);
		}
	}

	const [ state, setState ] = useState< AgentState >( {
		isConnected: !! clientRef.current,
		isLoading: false,
		error: initError,
		lastResponse: null,
	} );

	const sendMessage = useCallback(
		async (
			messageText: string,
			options: Partial< SendMessageParams > = {}
		): Promise< Task > => {
			if ( ! clientRef.current ) {
				throw new Error( 'Client not initialized' );
			}

			setState( ( prev ) => ( {
				...prev,
				isLoading: true,
				error: null,
			} ) );

			try {
				const message: Message =
					options.message || createTextMessage( messageText );

				const task = await clientRef.current.sendMessage( {
					message,
					...options,
				} );

				setState( ( prev ) => ( {
					...prev,
					isLoading: false,
					lastResponse: task,
				} ) );

				return task;
			} catch ( error ) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to send message';
				setState( ( prev ) => ( {
					...prev,
					isLoading: false,
					error: errorMessage,
				} ) );
				throw error;
			}
		},
		[]
	);

	const sendMessageStream = useCallback( async function* (
		messageText: string,
		options: Partial< SendMessageParams > = {}
	): AsyncIterable< TaskUpdate > {
		if ( ! clientRef.current ) {
			throw new Error( 'Client not initialized' );
		}

		setState( ( prev ) => ( { ...prev, isLoading: true, error: null } ) );

		try {
			const message: Message =
				options.message || createTextMessage( messageText );

			for await ( const update of clientRef.current.sendMessageStream( {
				message,
				...options,
			} ) ) {
				yield update;

				// Update state with final result
				if ( update.final ) {
					setState( ( prev ) => ( {
						...prev,
						isLoading: false,
						lastResponse: {
							id: update.id,
							status: update.status,
						},
					} ) );
				}
			}
		} catch ( error ) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to send streaming message';
			setState( ( prev ) => ( {
				...prev,
				isLoading: false,
				error: errorMessage,
			} ) );
			throw error;
		}
	}, [] );

	const clearError = useCallback( () => {
		setState( ( prev ) => ( { ...prev, error: null } ) );
	}, [] );

	const reset = useCallback( () => {
		setState( {
			isConnected: !! clientRef.current,
			isLoading: false,
			error: null,
			lastResponse: null,
		} );
	}, [] );

	return {
		state,
		sendMessage,
		sendMessageStream,
		clearError,
		reset,
	};
}
