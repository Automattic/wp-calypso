/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import ReactDom from 'react-dom';

import { calculateOffset, getBlockStyle, getDimensions, getDimensionUpdates } from '..';

beforeAll( () => {
	const header = {
		getBoundingClientRect: () => ( { height: 123 } ),
	};
	jest
		.spyOn( document, 'getElementById' )
		.mockImplementation( ( id ) => ( id === 'header' ? header : null)  );
	jest.spyOn( ReactDom, 'findDOMNode' ).mockImplementation( ( node ) => node );
} );

describe( 'calculateOffset', () => {
	test( 'returns the header height', () => {
		expect( calculateOffset() ).toEqual( 123 );
	} );
} );

describe( 'getBlockStyle', () => {
	test( 'returns a valid style if sticky', () => {
		const state = { isSticky: true, blockWidth: 200 };

		expect( getBlockStyle( state ) ).toEqual( { top: 123, width: 200 } );
	} );

	test( 'returns undefined if not sticky', () => {
		const state = { isSticky: false, blockWidth: 200 };

		expect( getBlockStyle( state ) ).toBeUndefined();
	} );
} );

describe( 'getDimensions', () => {
	test( 'should return dimensions when sticky', () => {
		const node = { clientHeight: 100, clientWidth: 200 };
		expect( getDimensions( node, true ) ).toEqual( { spacerHeight: 100, blockWidth: 200 } );
	} );

	test( 'should return zeroes when not sticky', () => {
		const node = { clientHeight: 100, clientWidth: 200 };
		expect( getDimensions( node, false ) ).toEqual( { spacerHeight: 0, blockWidth: 0 } );
	} );
} );

describe( 'getDimensionUpdates', () => {
	test( 'should return an update when dimensions change', () => {
		const previous = { isSticky: true, spacerHeight: 0, blockWidth: 0 };
		const node = { clientHeight: 100, clientWidth: 200 };

		expect( getDimensionUpdates( node, previous ) ).toEqual( {
			spacerHeight: 100,
			blockWidth: 200,
		} );
	} );

	test( 'should not return an update when dimensions stay the same', () => {
		const previous = { isSticky: true, spacerHeight: 100, blockWidth: 200 };
		const node = { clientHeight: 100, clientWidth: 200 };

		expect( getDimensionUpdates( node, previous ) ).toBeNull();
	} );
} );

afterAll( () => jest.restoreAllMocks() );
