/**
 * Geometry helpers for the floating chat panel. Positions are owned by the
 * consumer: seeded via `initialChatPosition` / `initialFreeDragPosition` and
 * persisted through `onChatPositionChange` / `onFreeDragEnd`.
 */

import { DEFAULT_BOUNDARY_INSETS, STYLE_CONSTANTS } from './constants';
import type { BoundaryInsets } from '../types';

export type ChatPosition = 'left' | 'right';

export const DEFAULT_CHAT_POSITION: ChatPosition = 'right';

/**
 * Clamp a free-drag pixel offset to the inset viewport so the panel can't be
 * stranded off-screen. Uses the same constraint geometry as the drag box:
 * x in [0, innerWidth - width - left - right], y in
 * [top + bottom + height - innerHeight, 0]. When the viewport is smaller
 * than the panel the min bound wins (Math.min runs after Math.max).
 *
 * @param position   - The free-drag pixel offset to clamp
 * @param position.x - Horizontal offset
 * @param position.y - Vertical offset
 * @param width      - Panel width
 * @param height     - Panel height
 * @param insets     - Per-side viewport insets (boundaryInset)
 * @return The clamped { x, y } pixel offset
 */
export function clampFreeDragPosition(
	{ x, y }: { x: number; y: number },
	width: number,
	height: number,
	insets: BoundaryInsets = DEFAULT_BOUNDARY_INSETS
): { x: number; y: number } {
	const maxX = window.innerWidth - width - insets.left - insets.right;
	const minY = insets.top + insets.bottom + height - window.innerHeight;

	return {
		x: Math.max( 0, Math.min( x, maxX ) ),
		y: Math.max( minY, Math.min( y, 0 ) ),
	};
}

/**
 * Analytic corner-snap transform offset for a docked panel. The panel is
 * CSS-anchored at `left: insets.left`, `bottom: insets.bottom`, so the
 * bottom edge is docked by CSS and needs no measurement — the docked `y`
 * transform is always 0. The right corner's x matches the `maxX` in
 * clampFreeDragPosition and the `cornerX` in getInitialChatPosition.
 *
 * @param side       - The corner side to dock to
 * @param panelWidth - Panel width
 * @param insets     - Per-side viewport insets (boundaryInset)
 * @return The docked { x, y } transform offset
 */
export function getCornerSnapPosition(
	side: 'left' | 'right',
	panelWidth: number,
	insets: BoundaryInsets = DEFAULT_BOUNDARY_INSETS
): { x: number; y: number } {
	const x =
		side === 'right'
			? window.innerWidth - panelWidth - insets.left - insets.right
			: 0;
	return { x, y: 0 };
}

/**
 * Compute the initial { x, y } pixel seed for the chat panel's motion values.
 *
 * In free drag mode with a seeded pixel position, that position is clamped to
 * the constraint box (matches dragConstraints) so a position persisted on a
 * larger viewport can't strand the panel off-screen on a smaller one.
 * Otherwise the panel is initialized at the seeded corner (right-aligned needs
 * an x offset; left is 0).
 *
 * @param options
 * @param options.freeDrag                - Whether free drag mode is enabled
 * @param options.initialFreeDragPosition - Persisted pixel position, if any
 * @param options.side                    - The corner side to seed
 * @param options.width                   - Panel width (defaults to COMPACT_WIDTH)
 * @param options.height                  - Panel height (defaults to EXPANDED_HEIGHT)
 * @param options.insets                  - Per-side viewport insets (boundaryInset)
 * @return The initial { x, y } pixel position
 */
export function getInitialChatPosition( {
	freeDrag,
	initialFreeDragPosition,
	side,
	width = STYLE_CONSTANTS.COMPACT_WIDTH,
	height = STYLE_CONSTANTS.EXPANDED_HEIGHT,
	insets = DEFAULT_BOUNDARY_INSETS,
}: {
	freeDrag: boolean;
	initialFreeDragPosition: { x: number; y: number } | undefined;
	side: ChatPosition;
	width?: number;
	height?: number;
	insets?: BoundaryInsets;
} ): { x: number; y: number } {
	const cornerX =
		side === 'right'
			? window.innerWidth - width - insets.left - insets.right
			: 0;

	if ( ! freeDrag || initialFreeDragPosition === undefined ) {
		return { x: cornerX, y: 0 };
	}

	// Clamp the seed so a persisted off-screen position is pulled back on-screen.
	return clampFreeDragPosition(
		initialFreeDragPosition,
		width,
		height,
		insets
	);
}
