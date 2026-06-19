/**
 * Utility functions for persisting chat UI preferences in localStorage
 */

import { STYLE_CONSTANTS } from './constants';

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
 * Compute the initial { x, y } pixel seed for the chat panel's motion values.
 *
 * In free drag mode with a persisted position, the saved pixel position is
 * clamped to the constraint box (matches dragConstraints) so a position saved
 * on a larger viewport can't strand the panel off-screen on a smaller one.
 * Otherwise the panel is initialized at the saved corner (right-aligned needs
 * an x offset; left is 0).
 *
 * @param options
 * @param options.freeDrag                - Whether free drag mode is enabled
 * @param options.initialFreeDragPosition - Persisted pixel position, if any
 * @param options.side                    - The saved corner side
 * @return The initial { x, y } pixel position
 */
export function getInitialChatPosition( {
	freeDrag,
	initialFreeDragPosition,
	side,
}: {
	freeDrag: boolean;
	initialFreeDragPosition: { x: number; y: number } | undefined;
	side: ChatPosition;
} ): { x: number; y: number } {
	const cornerX =
		side === 'right'
			? window.innerWidth -
			  STYLE_CONSTANTS.COMPACT_WIDTH -
			  STYLE_CONSTANTS.VIEWPORT_OFFSET * 2
			: 0;

	if ( ! freeDrag || initialFreeDragPosition === undefined ) {
		return { x: cornerX, y: 0 };
	}

	const maxSeedX =
		window.innerWidth -
		STYLE_CONSTANTS.COMPACT_WIDTH -
		STYLE_CONSTANTS.VIEWPORT_OFFSET * 2;
	const minSeedY =
		2 * STYLE_CONSTANTS.VIEWPORT_OFFSET +
		STYLE_CONSTANTS.EXPANDED_HEIGHT -
		window.innerHeight;

	// Clamp the seed so a persisted off-screen position is pulled back on-screen.
	return {
		x: Math.max( 0, Math.min( initialFreeDragPosition.x, maxSeedX ) ),
		y: Math.max( minSeedY, Math.min( initialFreeDragPosition.y, 0 ) ),
	};
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
