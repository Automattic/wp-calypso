/**
 * Internal dependencies
 */
import { sortGroupNames } from '../group-utils';

describe( 'sortGroupNames', () => {
	const preferredOrder = [ 'lemon', 'apple', 'bananna' ];

	it( 'sorts group object so property order (the ordered returned by Object.keys) matches the preferred order', () => {
		const unsorted = { apple: {}, lemon: {}, bananna: {} };
		const sorted = sortGroupNames( preferredOrder, unsorted );
		expect( Object.keys( unsorted ) ).toEqual( [ 'apple', 'lemon', 'bananna' ] );
		expect( Object.keys( sorted ) ).toEqual( [ 'lemon', 'apple', 'bananna' ] );
	} );

	it( 'leaves group properties exactly as they were before sorting', () => {
		const unsorted = { apple: { a: 1 }, lemon: { a: 2 }, bananna: { a: 3 } };
		const sorted = sortGroupNames( preferredOrder, unsorted );
		expect( sorted.apple ).toBe( unsorted.apple );
		expect( sorted.bananna ).toBe( unsorted.bananna );
		expect( sorted.lemon ).toBe( unsorted.lemon );
	} );

	it( 'works when preferred order contains names not present in the group object', () => {
		const unsorted = { bananna: {}, apple: {} };
		const sorted = sortGroupNames( preferredOrder, unsorted );
		expect( Object.keys( sorted ) ).toEqual( [ 'apple', 'bananna' ] );
	} );

	it( "alphabetically sorts group keys at the end if they're not in the preferred order", () => {
		const unsorted = { apple: {}, lemon: {}, bananna: {}, grape: {}, blueberry: {} };
		const sorted = sortGroupNames( preferredOrder, unsorted );
		expect( Object.keys( sorted ) ).toEqual( [
			'lemon',
			'apple',
			'bananna',
			'blueberry',
			'grape',
		] );
	} );
} );
