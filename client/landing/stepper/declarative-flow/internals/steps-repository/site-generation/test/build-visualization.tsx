/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render } from '@testing-library/react';
import {
	BuildVisualization,
	LAYOUT_HOLD_MS,
	LAYOUT_MORPH_MS,
	MAX_PARALLAX_PX,
	MAX_TILT_DEG,
	PRESS_RELEASE_MS,
	PREVIEW_LAYOUTS,
} from '../build-visualization';

const CYCLE_MS = LAYOUT_HOLD_MS + LAYOUT_MORPH_MS;

function mockMatchMedia( matches: boolean ) {
	Object.defineProperty( window, 'matchMedia', {
		configurable: true,
		writable: true,
		value: jest.fn( () => ( { matches } ) ),
	} );
}

function getFrame( container: HTMLElement ) {
	const frame = container.querySelector( '.site-generation__page-preview' ) as HTMLElement;
	frame.getBoundingClientRect = () => ( { left: 0, top: 0, width: 200, height: 100 } ) as DOMRect;
	return frame;
}

// jsdom has no PointerEvent; a MouseEvent carries the coordinates and this
// keeps the pointer type the component branches on.
class FakePointerEvent extends MouseEvent {
	pointerType: string;

	constructor( type: string, init: PointerEventInit = {} ) {
		super( type, init );
		this.pointerType = init.pointerType ?? 'mouse';
	}
}

describe( 'BuildVisualization', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		Object.defineProperty( window, 'PointerEvent', {
			configurable: true,
			writable: true,
			value: FakePointerEvent,
		} );
	} );

	afterEach( () => {
		jest.useRealTimers();
		delete ( window as { matchMedia?: unknown } ).matchMedia;
		delete ( window as { PointerEvent?: unknown } ).PointerEvent;
	} );

	it( 'alternates desktop and mobile frames, including across the loop boundary', () => {
		const frames = PREVIEW_LAYOUTS.map( ( layout ) => layout.frame );

		frames.forEach( ( frame, index ) => {
			expect( frame ).not.toBe( frames[ ( index + 1 ) % frames.length ] );
		} );
	} );

	it( 'holds each layout, morphs to the next, and wraps around', () => {
		mockMatchMedia( false );
		const { container } = render( <BuildVisualization /> );
		const frame = getFrame( container );

		expect( frame ).toHaveAttribute( 'data-layout', PREVIEW_LAYOUTS[ 0 ].id );
		expect( frame ).toHaveAttribute( 'data-frame', PREVIEW_LAYOUTS[ 0 ].frame );
		expect( frame ).toHaveAttribute( 'data-morphing', 'false' );

		act( () => jest.advanceTimersByTime( CYCLE_MS - 1 ) );
		expect( frame ).toHaveAttribute( 'data-layout', PREVIEW_LAYOUTS[ 0 ].id );

		act( () => jest.advanceTimersByTime( 1 ) );
		expect( frame ).toHaveAttribute( 'data-layout', PREVIEW_LAYOUTS[ 1 ].id );
		expect( frame ).toHaveAttribute( 'data-frame', PREVIEW_LAYOUTS[ 1 ].frame );
		expect( frame ).toHaveAttribute( 'data-morphing', 'true' );

		act( () => jest.advanceTimersByTime( LAYOUT_MORPH_MS / 2 ) );
		expect( frame ).toHaveAttribute( 'data-morphing', 'false' );

		act( () => jest.advanceTimersByTime( CYCLE_MS * ( PREVIEW_LAYOUTS.length - 1 ) ) );
		expect( frame ).toHaveAttribute( 'data-layout', PREVIEW_LAYOUTS[ 0 ].id );
	} );

	it( 'stays on the first layout when the user prefers reduced motion', () => {
		mockMatchMedia( true );
		const { container } = render( <BuildVisualization /> );

		act( () => jest.advanceTimersByTime( CYCLE_MS * 2 ) );

		expect( getFrame( container ) ).toHaveAttribute( 'data-layout', PREVIEW_LAYOUTS[ 0 ].id );
		expect( getFrame( container ) ).toHaveAttribute( 'data-morphing', 'false' );
	} );

	it( 'tilts toward the pointer and settles back when it leaves', () => {
		mockMatchMedia( false );
		const { container } = render( <BuildVisualization /> );
		const frame = getFrame( container );

		fireEvent.pointerMove( frame, { clientX: 200, clientY: 100, pointerType: 'mouse' } );
		act( () => jest.advanceTimersByTime( 16 ) );

		expect( frame.style.getPropertyValue( '--site-generation-tilt-x' ) ).toBe(
			`${ MAX_TILT_DEG }deg`
		);
		expect( frame.style.getPropertyValue( '--site-generation-tilt-y' ) ).toBe(
			`${ -MAX_TILT_DEG }deg`
		);
		expect( frame.style.getPropertyValue( '--site-generation-parallax-x' ) ).toBe(
			`${ -MAX_PARALLAX_PX }px`
		);
		expect( frame.style.getPropertyValue( '--site-generation-parallax-y' ) ).toBe(
			`${ -MAX_PARALLAX_PX }px`
		);

		fireEvent.pointerLeave( frame );

		expect( frame.style.getPropertyValue( '--site-generation-tilt-x' ) ).toBe( '0deg' );
		expect( frame.style.getPropertyValue( '--site-generation-tilt-y' ) ).toBe( '0deg' );
	} );

	it( 'ignores touch pointers', () => {
		mockMatchMedia( false );
		const { container } = render( <BuildVisualization /> );
		const frame = getFrame( container );

		fireEvent.pointerMove( frame, { clientX: 200, clientY: 100, pointerType: 'touch' } );
		act( () => jest.advanceTimersByTime( 16 ) );

		expect( frame.style.getPropertyValue( '--site-generation-tilt-x' ) ).toBe( '' );
	} );

	it( 'holds the current layout while the pointer is over the frame', () => {
		mockMatchMedia( false );
		const { container } = render( <BuildVisualization /> );
		const frame = getFrame( container );

		fireEvent.pointerEnter( frame );
		act( () => jest.advanceTimersByTime( CYCLE_MS * 2 ) );
		expect( frame ).toHaveAttribute( 'data-layout', PREVIEW_LAYOUTS[ 0 ].id );

		fireEvent.pointerLeave( frame );
		act( () => jest.advanceTimersByTime( CYCLE_MS - 1 ) );
		expect( frame ).toHaveAttribute( 'data-layout', PREVIEW_LAYOUTS[ 0 ].id );

		act( () => jest.advanceTimersByTime( 1 ) );
		expect( frame ).toHaveAttribute( 'data-layout', PREVIEW_LAYOUTS[ 1 ].id );
	} );

	it( 'advances to the next layout on release, even while the cycle is paused', () => {
		mockMatchMedia( false );
		const { container } = render( <BuildVisualization /> );
		const frame = getFrame( container );

		fireEvent.pointerEnter( frame );
		fireEvent.pointerDown( frame );
		fireEvent.pointerUp( frame );

		expect( frame ).toHaveAttribute( 'data-layout', PREVIEW_LAYOUTS[ 1 ].id );
		expect( frame ).toHaveAttribute( 'data-morphing', 'true' );

		act( () => jest.advanceTimersByTime( LAYOUT_MORPH_MS / 2 ) );
		expect( frame ).toHaveAttribute( 'data-morphing', 'false' );

		act( () => jest.advanceTimersByTime( CYCLE_MS * 2 ) );
		expect( frame ).toHaveAttribute( 'data-layout', PREVIEW_LAYOUTS[ 1 ].id );

		fireEvent.pointerLeave( frame );
		act( () => jest.advanceTimersByTime( CYCLE_MS ) );
		expect( frame ).toHaveAttribute( 'data-layout', PREVIEW_LAYOUTS[ 2 ].id );
	} );

	it( 'squeezes the frame while pressed and lets it spring back on release', () => {
		mockMatchMedia( false );
		const onTap = jest.fn();
		const { container } = render( <BuildVisualization onTap={ onTap } /> );
		const frame = getFrame( container );

		expect( frame ).not.toHaveAttribute( 'data-press' );

		fireEvent.pointerDown( frame );
		act( () => jest.advanceTimersByTime( 2000 ) );
		expect( frame ).toHaveAttribute( 'data-press', 'down' );
		expect( onTap ).not.toHaveBeenCalled();

		fireEvent.pointerUp( frame );
		expect( onTap ).toHaveBeenCalledTimes( 1 );
		expect( frame ).toHaveAttribute( 'data-press', 'up' );

		act( () => jest.advanceTimersByTime( PRESS_RELEASE_MS ) );
		expect( frame ).not.toHaveAttribute( 'data-press' );
	} );

	it( 'releases the squeeze without tinting when the pointer leaves mid-press', () => {
		mockMatchMedia( false );
		const onTap = jest.fn();
		const { container } = render( <BuildVisualization onTap={ onTap } /> );
		const frame = getFrame( container );

		fireEvent.pointerDown( frame );
		fireEvent.pointerLeave( frame );

		expect( frame ).toHaveAttribute( 'data-press', 'up' );
		expect( onTap ).not.toHaveBeenCalled();
	} );

	it( 'ignores the pointer when the user prefers reduced motion', () => {
		mockMatchMedia( true );
		const { container } = render( <BuildVisualization /> );
		const frame = getFrame( container );

		fireEvent.pointerMove( frame, { clientX: 200, clientY: 100, pointerType: 'mouse' } );
		act( () => jest.advanceTimersByTime( 16 ) );

		expect( frame.style.getPropertyValue( '--site-generation-tilt-x' ) ).toBe( '' );
	} );
} );
