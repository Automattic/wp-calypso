/**
 * Internal dependencies
 */
import { buildTermsTree } from '../terms';

describe( 'buildTermsTree()', () => {
	it( 'Should return empty array if parent is never specified.', () => {
		const input = Object.freeze( [ { term: 2232 }, { term: 2245 } ] );
		const termsTreem = buildTermsTree( input );
		expect( termsTreem ).toEqual( [] );
	} );
	it( 'Should return same array as input with empty children added if all the elements are top level', () => {
		const input = Object.freeze( [
			{ id: 2232, parent: 0, dummy: true },
			{ id: 2245, parent: 0, dummy: false },
		] );
		const output = [
			{ id: 2232, parent: 0, children: [], dummy: true },
			{ id: 2245, parent: 0, children: [], dummy: false },
		];
		const termsTreem = buildTermsTree( input );
		expect( termsTreem ).toEqual( output );
	} );
	it( 'Should return element with its child if a child exists', () => {
		const input = Object.freeze( [
			{ id: 2232, parent: 0 },
			{ id: 2245, parent: 2232 },
		] );
		const output = [
			{ id: 2232, parent: 0, children: [
				{ id: 2245, parent: 2232, children: [] },
			] },
		];
		const termsTreem = buildTermsTree( input );
		expect( termsTreem ).toEqual( output );
	} );
	it( 'Should return elements with multiple children and elements with no children', () => {
		const input = Object.freeze( [
			{ id: 2232, parent: 0 },
			{ id: 2245, parent: 2232 },
			{ id: 2249, parent: 0 },
			{ id: 2246, parent: 2232 },
		] );
		const output = [
			{ id: 2232, parent: 0, children: [
				{ id: 2245, parent: 2232, children: [] },
				{ id: 2246, parent: 2232, children: [] },
			] },
			{ id: 2249, parent: 0, children: [] },
		];
		const termsTreem = buildTermsTree( input );
		expect( termsTreem ).toEqual( output );
	} );
} );
