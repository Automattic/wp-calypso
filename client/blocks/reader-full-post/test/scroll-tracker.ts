/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import ScrollTracker from '../scroll-tracker';

describe( 'ScrollTracker', () => {
	let scrollTracker;
	let container;

	beforeEach( () => {
		scrollTracker = new ScrollTracker();
		container = document.createElement( 'div' );
		// Setup scrollable container
		Object.defineProperties( container, {
			scrollTop: { value: 0, configurable: true },
			scrollHeight: { value: 1000, configurable: true },
			clientHeight: { value: 500, configurable: true },
		} );
	} );

	afterEach( () => {
		scrollTracker.cleanup();
	} );

	describe( 'getMaxScrollDepth()', () => {
		it( 'should return 0 when no scrolling has occurred', () => {
			expect( scrollTracker.getMaxScrollDepth() ).toBe( 0 );
		} );

		it( 'should return correct depth when scrolled', () => {
			scrollTracker.setContainer( container );
			Object.defineProperty( container, 'scrollTop', { value: 250 } );
			container.dispatchEvent( new Event( 'scroll' ) );
			expect( scrollTracker.getMaxScrollDepth() ).toBe( 0.5 );
		} );

		it( 'should return the highest depth reached', () => {
			scrollTracker.setContainer( container );

			Object.defineProperty( container, 'scrollTop', { value: 375 } );
			container.dispatchEvent( new Event( 'scroll' ) );

			Object.defineProperty( container, 'scrollTop', { value: 250 } );
			container.dispatchEvent( new Event( 'scroll' ) );

			expect( scrollTracker.getMaxScrollDepth() ).toBe( 0.75 );
		} );

		it( 'should reset when container changes', () => {
			scrollTracker.setContainer( container );
			Object.defineProperty( container, 'scrollTop', { value: 250 } );
			container.dispatchEvent( new Event( 'scroll' ) );

			const newContainer = document.createElement( 'div' );
			Object.defineProperties( newContainer, {
				scrollTop: { value: 0, configurable: true },
				scrollHeight: { value: 1000, configurable: true },
				clientHeight: { value: 500, configurable: true },
			} );
			scrollTracker.setContainer( newContainer );

			expect( scrollTracker.getMaxScrollDepth() ).toBe( 0 );
		} );
	} );

	describe( 'getMaxScrollDepthAsPercentage()', () => {
		it( 'should return 0 when no scrolling has occurred', () => {
			expect( scrollTracker.getMaxScrollDepthAsPercentage() ).toBe( 0 );
		} );

		it( 'should return the correct percentage when scrolled', () => {
			scrollTracker.setContainer( container );
			Object.defineProperty( container, 'scrollTop', { value: 250 } );
			container.dispatchEvent( new Event( 'scroll' ) );
			expect( scrollTracker.getMaxScrollDepthAsPercentage() ).toBe( 50 );
		} );

		it( 'should return the highest percentage reached', () => {
			scrollTracker.setContainer( container );

			Object.defineProperty( container, 'scrollTop', { value: 375 } );
			container.dispatchEvent( new Event( 'scroll' ) );

			Object.defineProperty( container, 'scrollTop', { value: 250 } );
			container.dispatchEvent( new Event( 'scroll' ) );

			expect( scrollTracker.getMaxScrollDepthAsPercentage() ).toBe( 75 );
		} );
	} );

	describe( 'setContainer()', () => {
		it( 'should track scroll events on the new container', () => {
			scrollTracker.setContainer( container );
			Object.defineProperty( container, 'scrollTop', { value: 250 } );
			container.dispatchEvent( new Event( 'scroll' ) );
			expect( scrollTracker.getMaxScrollDepthAsPercentage() ).toBe( 50 );
		} );

		it( 'should stop tracking previous container when setting new one', () => {
			const oldContainer = document.createElement( 'div' );
			Object.defineProperties( oldContainer, {
				scrollTop: { value: 0, configurable: true },
				scrollHeight: { value: 1000, configurable: true },
				clientHeight: { value: 500, configurable: true },
			} );

			scrollTracker.setContainer( oldContainer );
			Object.defineProperty( oldContainer, 'scrollTop', { value: 250 } );
			oldContainer.dispatchEvent( new Event( 'scroll' ) );

			scrollTracker.setContainer( container );
			Object.defineProperty( oldContainer, 'scrollTop', { value: 375 } );
			oldContainer.dispatchEvent( new Event( 'scroll' ) );

			expect( scrollTracker.getMaxScrollDepthAsPercentage() ).toBe( 0 );
		} );
	} );

	describe( 'cleanup()', () => {
		it( 'should stop tracking scroll events', () => {
			scrollTracker.setContainer( container );
			scrollTracker.cleanup();

			Object.defineProperty( container, 'scrollTop', { value: 250 } );
			container.dispatchEvent( new Event( 'scroll' ) );

			expect( scrollTracker.getMaxScrollDepthAsPercentage() ).toBe( 0 );
		} );
	} );
} );
