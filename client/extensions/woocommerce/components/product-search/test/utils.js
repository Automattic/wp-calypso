/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	addProductId,
	removeProductId,
	isProductSelected,
	areVariationsSelected,
	productContainsString,
	isVariableProduct,
} from '../utils';

describe( 'addProductId', () => {
	it( 'should be a function', () => {
		expect( addProductId ).to.be.a( 'function' );
	} );

	it( 'should add a single product', () => {
		expect( addProductId( undefined, 2 ) ).to.eql( [ 2 ] );
		expect( addProductId( [], 2 ) ).to.eql( [ 2 ] );
		expect( addProductId( [ 1 ], 2 ) ).to.eql( [ 1, 2 ] );
	} );

	it( 'should add a list of products', () => {
		expect( addProductId( undefined, [ 3, 4 ] ) ).to.eql( [ 3, 4 ] );
		expect( addProductId( [], [ 3, 4 ] ) ).to.eql( [ 3, 4 ] );
		expect( addProductId( [ 1, 2 ], [ 3, 4 ] ) ).to.eql( [ 1, 2, 3, 4 ] );
	} );

	it( 'should not duplicate a product already in the list', () => {
		expect( addProductId( [ 1, 2 ], 2 ) ).to.eql( [ 1, 2 ] );
		expect( addProductId( [ 1, 2 ], [ 2, 3 ] ) ).to.eql( [ 1, 2, 3 ] );
	} );
} );

describe( 'removeProductId', () => {
	it( 'should be a function', () => {
		expect( removeProductId ).to.be.a( 'function' );
	} );

	it( 'should remove a single product', () => {
		expect( removeProductId( [ 1, 2, 3 ], 2 ) ).to.eql( [ 1, 3 ] );
		expect( removeProductId( [ 2 ], 2 ) ).to.eql( [] );
	} );

	it( 'should remove a list of products', () => {
		expect( removeProductId( [ 1, 2, 3 ], [ 1, 3 ] ) ).to.eql( [ 2 ] );
		expect( removeProductId( [ 1, 2 ], [ 1, 2 ] ) ).to.eql( [] );
	} );

	it( 'should remove products that exist in the list, and ignore others', () => {
		expect( removeProductId( [ 1, 2, 3 ], [ 1, 5 ] ) ).to.eql( [ 2, 3 ] );
		expect( removeProductId( [], 2 ) ).to.eql( [] );
	} );
} );

describe( 'isProductSelected', () => {
	it( 'should be a function', () => {
		expect( isProductSelected ).to.be.a( 'function' );
	} );

	it( 'should be true if the product is selected', () => {
		expect( isProductSelected( 2, 2 ) ).to.be.true;
		expect( isProductSelected( [ 1, 2, 3 ], 2 ) ).to.be.true;
	} );

	it( 'should be false if the product is not selected', () => {
		expect( isProductSelected( 3, 2 ) ).to.be.false;
		expect( isProductSelected( [ 1, 3, 4 ], 2 ) ).to.be.false;
		expect( isProductSelected( [], 2 ) ).to.be.false;
	} );

	it( 'should be false if the value is not valid', () => {
		expect( isProductSelected( false, 2 ) ).to.be.false;
		expect( isProductSelected( null, 2 ) ).to.be.false;
	} );
} );

describe( 'areVariationsSelected', () => {
	it( 'should be a function', () => {
		expect( areVariationsSelected ).to.be.a( 'function' );
	} );

	it( 'should be false if there are no variations', () => {
		const product = {
			variations: [],
		};
		expect( areVariationsSelected( 2, product ) ).to.be.false;
		expect( areVariationsSelected( [], product ) ).to.be.false;
		expect( areVariationsSelected( [ 1, 2, 3 ], product ) ).to.be.false;
	} );

	it( 'should be true if any variations are selected', () => {
		const product = {
			variations: [ 5, 6, 7 ],
		};
		expect( areVariationsSelected( 6, product ) ).to.be.true;
		expect( areVariationsSelected( [ 1, 2, 5 ], product ) ).to.be.true;
		expect( areVariationsSelected( [ 5, 6 ], product ) ).to.be.true;
	} );
} );

describe( 'productContainsString', () => {
	it( 'should be a function', () => {
		expect( productContainsString ).to.be.a( 'function' );
	} );

	it( 'should return true if the string exists in the product, regardless of case', () => {
		const product = {
			name: 'Test Product Hello World',
			attributes: [
				{
					options: [ 'Red', 'Yellow' ],
					variation: true,
				},
				{
					options: [ 'Small', 'Large' ],
					variation: true,
				},
			],
		};
		expect( productContainsString( product, 'World' ) ).to.be.true;
		expect( productContainsString( product, 'Red' ) ).to.be.true;
		expect( productContainsString( product, 'Small' ) ).to.be.true;
		expect( productContainsString( product, 'hello' ) ).to.be.true;
		expect( productContainsString( product, 'large' ) ).to.be.true;
	} );

	it( 'should return false if the string does not exist in the product', () => {
		const product = {
			name: 'Test Product Hello World',
			attributes: [
				{
					options: [ 'Red', 'Yellow' ],
					variation: true,
				},
				{
					options: [ 'Small', 'Large' ],
					variation: true,
				},
			],
		};
		expect( productContainsString( product, 'Foo' ) ).to.be.false;
		expect( productContainsString( product, 'Blue' ) ).to.be.false;
		expect( productContainsString( product, 'Medium' ) ).to.be.false;
	} );

	it( 'should return false if the string does not exist in selectable variations', () => {
		const product = {
			name: 'Test Product Hello World',
			attributes: [
				{
					options: [ 'Blue', 'Green' ],
					variation: false,
				},
			],
		};
		expect( productContainsString( product, 'Blue' ) ).to.be.false;
	} );
} );

describe( 'isVariableProduct', () => {
	it( 'should be a function', () => {
		expect( isVariableProduct ).to.be.a( 'function' );
	} );

	it( 'should return true if the product is variable', () => {
		const product = {
			type: 'variable',
		};
		expect( isVariableProduct( product ) ).to.be.true;
	} );

	it( 'should return false if the product is a variation', () => {
		const product = {
			type: 'variable',
			isVariation: true,
		};
		expect( isVariableProduct( product ) ).to.be.false;
	} );

	it( 'should return false if the product is simple', () => {
		const product = {
			type: 'simple',
		};
		expect( isVariableProduct( product ) ).to.be.false;
	} );
} );
