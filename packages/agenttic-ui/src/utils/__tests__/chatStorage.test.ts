// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getInitialChatPosition } from '../chatStorage';
import { STYLE_CONSTANTS } from '../constants';

const { COMPACT_WIDTH, VIEWPORT_OFFSET, EXPANDED_HEIGHT } = STYLE_CONSTANTS;

function setViewport( width: number, height: number ): void {
	window.innerWidth = width;
	window.innerHeight = height;
}

describe( 'getInitialChatPosition', () => {
	const originalWidth = window.innerWidth;
	const originalHeight = window.innerHeight;

	beforeEach( () => {
		setViewport( 1440, 900 );
	} );

	afterEach( () => {
		setViewport( originalWidth, originalHeight );
	} );

	it( 'corner init on the left → top-left { 0, 0 }', () => {
		expect(
			getInitialChatPosition( {
				freeDrag: false,
				initialFreeDragPosition: undefined,
				side: 'left',
			} )
		).toEqual( { x: 0, y: 0 } );
	} );

	it( 'corner init on the right → right-edge offset, y 0', () => {
		const expectedX = 1440 - COMPACT_WIDTH - VIEWPORT_OFFSET * 2;
		expect(
			getInitialChatPosition( {
				freeDrag: false,
				initialFreeDragPosition: undefined,
				side: 'right',
			} )
		).toEqual( { x: expectedX, y: 0 } );
	} );

	it( 'corner init when freeDrag is on but no persisted position', () => {
		expect(
			getInitialChatPosition( {
				freeDrag: true,
				initialFreeDragPosition: undefined,
				side: 'left',
			} )
		).toEqual( { x: 0, y: 0 } );
	} );

	it( 'free drag seed in range → passthrough', () => {
		expect(
			getInitialChatPosition( {
				freeDrag: true,
				initialFreeDragPosition: { x: 200, y: -100 },
				side: 'left',
			} )
		).toEqual( { x: 200, y: -100 } );
	} );

	it( 'free drag seed out of range → clamped to bounds', () => {
		const maxSeedX = 1440 - COMPACT_WIDTH - VIEWPORT_OFFSET * 2;
		const minSeedY = 2 * VIEWPORT_OFFSET + EXPANDED_HEIGHT - 900;
		// x beyond the right edge clamps down, y above the top (positive) clamps to 0.
		expect(
			getInitialChatPosition( {
				freeDrag: true,
				initialFreeDragPosition: { x: 99999, y: 99999 },
				side: 'left',
			} )
		).toEqual( { x: maxSeedX, y: 0 } );
		// y below the bottom clamps up to minSeedY.
		expect(
			getInitialChatPosition( {
				freeDrag: true,
				initialFreeDragPosition: { x: 0, y: -99999 },
				side: 'left',
			} )
		).toEqual( { x: 0, y: minSeedY } );
	} );

	it( 'viewport smaller than panel ( max < min ) → returns the visible min, no NaN/negative', () => {
		setViewport( 200, 200 );
		const result = getInitialChatPosition( {
			freeDrag: true,
			initialFreeDragPosition: { x: 500, y: -500 },
			side: 'left',
		} );
		// With max < min, clamp lets min win so the top-left stays visible.
		expect( result.x ).toBe( 0 );
		expect( result.y ).toBe( 2 * VIEWPORT_OFFSET + EXPANDED_HEIGHT - 200 );
		expect( Number.isNaN( result.x ) ).toBe( false );
		expect( Number.isNaN( result.y ) ).toBe( false );
	} );
} );
