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
	}, [ ref ] );

	return <div ref={ ref } />;
}

describe( 'useInView suite', () => {
	beforeEach( () => {
		( window as any ).IntersectionObserver = class IO {
			constructor( private handler: ( entries: { isIntersecting: boolean }[] ) => void ) {
				// expose the handler so it can be called in tests
				( window as any ).intersectionObserverHandler = () => {
					handler( [ { isIntersecting: true } ] );
				};
			}

			observe() {
				return null;
			}

			disconnect() {
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
} );
