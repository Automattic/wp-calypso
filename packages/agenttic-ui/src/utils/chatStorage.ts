/**
 * Utility functions for persisting chat UI preferences in localStorage
 */

const STORAGE_KEY = 'agenttic-chat-position';

export type ChatPosition = 'left' | 'right';

/**
 * Get the saved chat position from localStorage
 * @param defaultValue - The position to return if no saved value exists (defaults to 'left')
 * @return The saved position or the default value
 */
export function getChatPosition(
	defaultValue: ChatPosition = 'left'
): ChatPosition {
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
	return defaultValue;
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
