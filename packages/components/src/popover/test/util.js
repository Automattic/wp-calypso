/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import Popover from '../index';
import { arrowLeftOffset, constrainLeft, onViewportChange } from '../util';

describe( 'arrowLeftOffset', () => {
	const element = {
		getBoundingClientRect: () => ( { width: 200 } ),
	};

	beforeEach( () => {
		Object.defineProperty( window, 'pageXOffset', { configurable: true, value: 0 } );
	} );

	test( 'returns the container center for a centered target', () => {
		const target = {
			getBoundingClientRect: () => ( { left: 180, width: 40 } ),
		};

		expect( arrowLeftOffset( { left: 100 }, element, target ) ).toBe( 100 );
	} );

	test( 'returns the target center relative to a left-clamped popover', () => {
		const target = {
			getBoundingClientRect: () => ( { left: 180, width: 40 } ),
		};

		expect( arrowLeftOffset( { left: 160 }, element, target ) ).toBe( 40 );
	} );

	test( 'clamps the offset to the minimum inset', () => {
		const target = {
			getBoundingClientRect: () => ( { left: 100, width: 20 } ),
		};

		expect( arrowLeftOffset( { left: 200 }, element, target ) ).toBe( 20 );
	} );

	test( 'clamps the offset to the maximum inset', () => {
		const target = {
			getBoundingClientRect: () => ( { left: 300, width: 20 } ),
		};

		expect( arrowLeftOffset( { left: 100 }, element, target ) ).toBe( 180 );
	} );
} );

describe( 'constrainLeft', () => {
	const element = {
		getBoundingClientRect: () => ( { width: 100 } ),
	};

	beforeEach( () => {
		Object.defineProperty( window, 'innerWidth', { configurable: true, value: 1000 } );
		onViewportChange();
	} );

	test( 'clamps the left offset at zero by default', () => {
		expect( constrainLeft( { left: -20 }, element ) ).toEqual( { left: 0 } );
	} );

	test( 'respects a numeric left boundary', () => {
		expect( constrainLeft( { left: 100 }, element, false, 160 ) ).toEqual( { left: 160 } );
	} );

	test( 'resolves a function left boundary', () => {
		const leftBoundary = jest.fn( () => 160 );

		expect( constrainLeft( { left: 100 }, element, false, leftBoundary ) ).toEqual( {
			left: 160,
		} );
		expect( leftBoundary ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'uses the viewport width as the right boundary by default', () => {
		expect( constrainLeft( { left: 950 }, element ) ).toEqual( { left: 900 } );
	} );

	test( 'respects a numeric right boundary', () => {
		expect( constrainLeft( { left: 800 }, element, false, 0, 700 ) ).toEqual( { left: 600 } );
	} );

	test( 'resolves a function right boundary', () => {
		const rightBoundary = jest.fn( () => 700 );

		expect( constrainLeft( { left: 800 }, element, false, 0, rightBoundary ) ).toEqual( {
			left: 600,
		} );
		expect( rightBoundary ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'lets the left boundary win when the boundaries conflict', () => {
		expect( constrainLeft( { left: 500 }, element, false, 550, 600 ) ).toEqual( {
			left: 550,
		} );
	} );
} );

test( 'positions the rendered arrow over the target after clamping', async () => {
	const target = document.createElement( 'button' );
	document.body.appendChild( target );
	const rect = ( { left = 0, top = 0, width = 0, height = 0 } = {} ) => ( {
		left,
		top,
		right: left + width,
		bottom: top + height,
		width,
		height,
		x: left,
		y: top,
		toJSON: () => {},
	} );
	const getBoundingClientRect = jest
		.spyOn( Element.prototype, 'getBoundingClientRect' )
		.mockImplementation( function () {
			if ( this === target ) {
				return rect( { left: 100, top: 100, width: 20, height: 20 } );
			}
			if ( this.classList?.contains( 'popover__inner' ) ) {
				return rect( { width: 200, height: 100 } );
			}
			return rect();
		} );
	const renderPopover = ( props = {} ) => (
		<Popover
			isVisible
			context={ target }
			position="bottom"
			autoPosition={ false }
			focusOnShow={ false }
			leftBoundary={ 50 }
			{ ...props }
		>
			Popover content
		</Popover>
	);
	const { rerender, unmount } = render( renderPopover() );

	try {
		await waitFor( () => {
			const arrow = screen.getByRole( 'tooltip' ).querySelector( '.popover__arrow' );
			expect( arrow ).toHaveStyle( { left: '60px' } );
		} );

		rerender( renderPopover( { position: 'bottom right' } ) );
		await waitFor( () => {
			const arrow = screen.getByRole( 'tooltip' ).querySelector( '.popover__arrow' );
			expect( arrow ).not.toHaveStyle( { left: '60px' } );
			expect( arrow.style.left ).toBe( '' );
		} );

		rerender( renderPopover( { customPosition: { left: 40, top: 120 } } ) );
		await waitFor( () => {
			const arrow = screen.getByRole( 'tooltip' ).querySelector( '.popover__arrow' );
			expect( arrow.style.left ).toBe( '' );
		} );
	} finally {
		unmount();
		target.remove();
		getBoundingClientRect.mockRestore();
	}
} );
