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
	const [ state, setState ] = useState< AgentState >( {
		isConnected: false,
		isLoading: false,
		error: null,
		lastResponse: null,
	} );

	// Use ref to store client to avoid recreating on every render
	const clientRef = useRef< A2AClient | null >( null );

	// Initialize client when config changes
	useEffect( () => {
		try {
			clientRef.current = createA2AClient( {
				...config,
				dispatcher: defaultDispatcher, // Always use browser dispatcher
			} );

			setState( ( prev ) => ( {
				...prev,
				isConnected: true,
				error: null,
			} ) );
		} catch ( error ) {
			setState( ( prev ) => ( {
				...prev,
				isConnected: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to initialize client',
			} ) );
		}
	}, [
		config.agentUrl,
		config.authProvider,
		config.timeout,
		config.proxy,
		config,
	] );

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
