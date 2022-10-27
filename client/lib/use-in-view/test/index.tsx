/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { useInView } from '../index';

function TestComponent( {
	totalTimesInView,
	callback,
}: {
	totalTimesInView: number;
	callback: () => void;
} ) {
	const ref = useInView< HTMLDivElement >( callback );

	useEffect( () => {
		if ( ref ) {
			Array.from( { length: totalTimesInView } ).forEach( () => {
				// simulate the element appearing in view and fire the handler
				( window as any ).intersectionObserverHandler();
			} );
		}
	}, [ ref, totalTimesInView ] );

	return <div ref={ ref } />;
}

describe( 'useInView suite', () => {
	beforeEach( () => {
		( window as any ).IntersectionObserver = class IO {
			disconnected = false;

			constructor( private handler: ( entries: { isIntersecting: boolean }[] ) => void ) {
				// expose the handler so it can be called in tests
				( window as any ).intersectionObserverHandler = () => {
					if ( this.disconnected ) {
						return;
					}

					handler( [ { isIntersecting: true } ] );
				};
			}

			observe() {
				return null;
			}

			disconnect() {
				this.disconnected = true;
				return null;
			}
		};
	} );

	it( 'Component is never in view so event never fires', () => {
		let count = 0;
		const callback = () => count++;
		render( <TestComponent totalTimesInView={ 0 } callback={ callback } /> );
		expect( count ).toBe( 0 );
	} );

	it( 'Component is in view once, event fires once', () => {
		let count = 0;
		const callback = () => count++;
		render( <TestComponent totalTimesInView={ 1 } callback={ callback } /> );
		expect( count ).toBe( 1 );
	} );

	it( 'Component is in view twice, event fires once', () => {
		let count = 0;
		const callback = () => count++;
		render( <TestComponent totalTimesInView={ 2 } callback={ callback } /> );
		expect( count ).toBe( 1 );
	} );

	it( 'Component renders twice, first out view, second in view, event fires once', () => {
		let count = 0;
		// The callback is generated in each render, so it's a new function
		const { rerender } = render(
			<TestComponent totalTimesInView={ 0 } callback={ () => count++ } />
		);
		rerender( <TestComponent totalTimesInView={ 1 } callback={ () => count++ } /> );
		expect( count ).toBe( 1 );
	} );
} );
