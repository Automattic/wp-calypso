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
 * Clamp a free-drag pixel offset to the inset viewport so the panel can't be
 * stranded off-screen. Uses the same constraint geometry as the drag box:
 * x in [0, innerWidth - width - VIEWPORT_OFFSET*2], y in
 * [2*VIEWPORT_OFFSET + height - innerHeight, 0]. When the viewport is smaller
 * than the panel the min bound wins (Math.min runs after Math.max).
 *
 * @param position   - The free-drag pixel offset to clamp
 * @param position.x - Horizontal offset
 * @param position.y - Vertical offset
 * @param width      - Panel width
 * @param height     - Panel height
 * @return The clamped { x, y } pixel offset
 */
export function clampFreeDragPosition(
	{ x, y }: { x: number; y: number },
	width: number,
	height: number
): { x: number; y: number } {
	const maxX =
		window.innerWidth - width - STYLE_CONSTANTS.VIEWPORT_OFFSET * 2;
	const minY =
		2 * STYLE_CONSTANTS.VIEWPORT_OFFSET + height - window.innerHeight;

	return {
		x: Math.max( 0, Math.min( x, maxX ) ),
		y: Math.max( minY, Math.min( y, 0 ) ),
	};
}

/**
 * Analytic corner-snap transform offset for a docked panel. The panel is
 * CSS-anchored at `left: VIEWPORT_OFFSET`, `bottom: VIEWPORT_OFFSET`, so the
 * bottom edge is docked by CSS and needs no measurement — the docked `y`
 * transform is always 0. The right corner's x matches the `maxX` in
 * clampFreeDragPosition and the `cornerX` in getInitialChatPosition.
 *
 * @param side       - The corner side to dock to
 * @param panelWidth - Panel width
 * @return The docked { x, y } transform offset
 */
export function getCornerSnapPosition(
	side: 'left' | 'right',
	panelWidth: number
): { x: number; y: number } {
	const x =
		side === 'right'
			? window.innerWidth -
			  panelWidth -
			  STYLE_CONSTANTS.VIEWPORT_OFFSET * 2
			: 0;
	return { x, y: 0 };
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
 * @param options.width                   - Panel width (defaults to COMPACT_WIDTH)
 * @param options.height                  - Panel height (defaults to EXPANDED_HEIGHT)
 * @return The initial { x, y } pixel position
 */
export function getInitialChatPosition( {
	freeDrag,
	initialFreeDragPosition,
	side,
	width = STYLE_CONSTANTS.COMPACT_WIDTH,
	height = STYLE_CONSTANTS.EXPANDED_HEIGHT,
}: {
	freeDrag: boolean;
	initialFreeDragPosition: { x: number; y: number } | undefined;
	side: ChatPosition;
	width?: number;
	height?: number;
} ): { x: number; y: number } {
	const cornerX =
		side === 'right'
			? window.innerWidth - width - STYLE_CONSTANTS.VIEWPORT_OFFSET * 2
			: 0;

	if ( ! freeDrag || initialFreeDragPosition === undefined ) {
		return { x: cornerX, y: 0 };
	}

	// Clamp the seed so a persisted off-screen position is pulled back on-screen.
	return clampFreeDragPosition( initialFreeDragPosition, width, height );
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
