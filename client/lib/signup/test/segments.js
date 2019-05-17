/**
 * @format
 */

/**
 * Internal dependencies
 */

import { getSegmentDefinition } from '../segments';

describe( 'getSegmentDefinition()', () => {
	const definitions = {
		a: { scooby: 'doo' },
		b: { shaggy: 'doo' },
	};

	test( 'should return `null` by default', () => {
		expect( getSegmentDefinition() ).toBeNull();
	} );

	test( 'should return `null` if key not found', () => {
		expect( getSegmentDefinition( 'friday', definitions ) ).toBeNull();
	} );

	test( 'should return value of supplied property', () => {
		expect( getSegmentDefinition( 'a', definitions ) ).toEqual( definitions.a );
	} );
} );
