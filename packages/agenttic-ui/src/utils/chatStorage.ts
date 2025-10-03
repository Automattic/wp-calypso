/**
 * Utility functions for persisting chat UI preferences in localStorage
 */

const STORAGE_KEY = 'agenttic-chat-position';

export type ChatPosition = 'left' | 'right';

/**
 * Get the saved chat position from localStorage
 * @return The saved position or 'left' as default
 */
export function getChatPosition(): ChatPosition {
	try {
		const saved = localStorage.getItem( STORAGE_KEY );
		if ( saved === 'left' || saved === 'right' ) {
			return saved;
		}
	} catch ( error ) {
		// localStorage might not be available (SSR, privacy mode, etc.)
		// eslint-disable-next-line no-console
		console.warn(
			'Failed to read chat position from localStorage:',
			error
		);
	}
	return 'left';
}

/**
 * Save the chat position to localStorage
 * @param position - The position to save ('left' or 'right')
 */
export function setChatPosition( position: ChatPosition ): void {
	try {
		localStorage.setItem( STORAGE_KEY, position );
	} catch ( error ) {
		// localStorage might not be available (SSR, privacy mode, etc.)
		// eslint-disable-next-line no-console
		console.warn( 'Failed to save chat position to localStorage:', error );
	}
}
