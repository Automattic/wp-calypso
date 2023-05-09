import { mergeHandlers } from '../utils';

describe( '#mergeHandlers', () => {
	const inc = ( a ) => a + 1;
	const triple = ( a ) => a * 3;
	const action = 'DO_MATH';
	const first = { [ action ]: [ inc ] };
	const second = { [ action ]: [ triple ] };

	test( 'should pass through a single handler', () => {
		expect( mergeHandlers( first ) ).toEqual( first );
	} );

	test( 'should combine lists of handlers for different action types', () => {
		const merged = mergeHandlers( { INCREMENT: [ inc ] }, { TRIPLE: [ triple ] } );

		expect( merged ).toEqual( {
			INCREMENT: [ inc ],
			TRIPLE: [ triple ],
		} );
	} );

	test( 'should combine lists of handlers for the same action type', () => {
		const merged = mergeHandlers( first, second );

		expect( merged[ action ] ).toEqual( [ inc, triple ] );
	} );
} );
