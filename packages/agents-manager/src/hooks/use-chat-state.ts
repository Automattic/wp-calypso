/**
 * Hook for managing floating chat state (collapsed/expanded)
 * State is persisted to localStorage
 */

import { useCallback, useState } from 'react';

const DEFAULT_STORAGE_KEY = 'agents-manager-chat-state';

export type ChatState = 'collapsed' | 'expanded';

/**
 * Load chat state from localStorage
 */
const loadChatState = ( storageKey: string ): ChatState => {
	try {
		const saved = localStorage.getItem( storageKey );
		if ( saved === 'collapsed' || saved === 'expanded' ) {
			return saved;
		}
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.warn( '[AgentDock] Failed to read chat state from localStorage:', error );
	}
	return 'collapsed';
};

/**
 * Save chat state to localStorage
 * @param {string} storageKey - The localStorage key to use
 * @param {ChatState} state - The chat state to save
 */
const saveChatState = ( storageKey: string, state: ChatState ): void => {
	try {
		localStorage.setItem( storageKey, state );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.warn( '[AgentDock] Failed to save chat state to localStorage:', error );
	}
};

export interface UseChatStateResult {
	chatState: ChatState;
	toggleExpand: () => void;
	collapse: () => void;
	expand: () => void;
}

export interface UseChatStateOptions {
	/**
	 * localStorage key for persisting chat state
	 * @default 'agents-manager-chat-state'
	 */
	storageKey?: string;
}

/**
 * Hook for managing floating chat state
 * @param {UseChatStateOptions} options - Configuration options
 */
export function useChatState( options: UseChatStateOptions = {} ): UseChatStateResult {
	const { storageKey = DEFAULT_STORAGE_KEY } = options;

	const [ chatState, setChatState ] = useState< ChatState >( () => {
		const loaded = loadChatState( storageKey );
		return loaded;
	} );

	const toggleExpand = useCallback( () => {
		const newState = chatState === 'expanded' ? 'collapsed' : 'expanded';
		setChatState( newState );
		saveChatState( storageKey, newState );
	}, [ chatState, storageKey ] );

	const collapse = useCallback( () => {
		setChatState( 'collapsed' );
		saveChatState( storageKey, 'collapsed' );
	}, [ storageKey ] );

	const expand = useCallback( () => {
		setChatState( 'expanded' );
		saveChatState( storageKey, 'expanded' );
	}, [ storageKey ] );

	return {
		chatState,
		toggleExpand,
		collapse,
		expand,
	};
}
