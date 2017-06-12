/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import generateVariations from '../index';

describe( 'generateVariations', () => {
	it( 'returns an empty array when passed a product with no attributes', () => {
		const product = { id: 1 };
		const variations = generateVariations( product );
		expect( variations ).to.eql( [] );
	} );
	it( 'returns an empty array when passed a product with non-variation attributes', () => {
		const product = { id: 1, attributes: [
			{
				name: 'Test Attribute',
				options: [ 'Option' ],
				variation: false,
				uid: 'edit_0',
			}
		] };
		const variations = generateVariations( product );
		expect( variations ).to.eql( [] );
	} );
	it( 'generates simple variations when passed a product with one product variation attribute', () => {
		const product = { id: 1, attributes: [
			{
				name: 'Color',
				options: [ 'Red', 'Blue' ],
				variation: true,
				uid: 'edit_0',
			}
		] };

		const variations = generateVariations( product );
		expect( variations[ 0 ].attributes ).to.eql( [
			{
				name: 'Color',
				option: 'Red',
			},
		] );

		expect( variations[ 1 ].attributes ).to.eql( [
			{
				name: 'Color',
				option: 'Blue',
			},
		] );
	} );
	it( 'generates a cartesian of variations when passed a product with multiple variation attributes', () => {
		const product = { id: 1, attributes: [
			{
				name: 'Color',
				options: [ 'Red', 'Blue' ],
				variation: true,
				uid: 'edit_0',
			},
			{
				name: 'Size',
				options: [ 'Small' ],
				variation: true,
				uid: 'edit_1',
			},
		] };

		const variations = generateVariations( product );

		expect( variations[ 0 ].attributes ).to.eql( [
			{
				name: 'Color',
				option: 'Red'
			},
			{
				name: 'Size',
				option: 'Small',
			}
		] );

		expect( variations[ 1 ].attributes ).to.eql( [
			{
				name: 'Color',
				option: 'Blue'
			},
			{
				name: 'Size',
				option: 'Small',
			}
		] );
	} );
	it( 'generates a complex cartesian of variations when passed a product with multiple variation attributes and multiple options', () => {
		const product = { id: 1, attributes: [
			{
				name: 'Color',
				options: [ 'Red', 'Blue', 'Green' ],
				variation: true,
				uid: 'edit_0',
			},
			{
				name: 'Size',
				options: [ 'Small', 'Medium' ],
				variation: true,
				uid: 'edit_1',
			},
			{
				name: 'Sleeves',
				options: [ 'Short', 'Long' ],
				variation: true,
				uid: 'edit_2',
			},
		] };

		const variations = generateVariations( product );

		expect( variations.length ).to.eql( 12 );
		expect( variations[ 0 ].attributes ).to.eql( [
			{
				name: 'Color',
				option: 'Red',
			},
			{
				name: 'Size',
				option: 'Small',
			},
			{
				name: 'Sleeves',
				option: 'Short',
			},
		] );
	} );

	it( 'generates a default variation sku with product name', () => {
		const product = { id: 1, name: 'Shirt', attributes: [
			{
				name: 'Color',
				options: [ 'Red', 'Blue' ],
				variation: true,
				uid: 'edit_0',
			},
			{
				name: 'Size',
				options: [ 'Small' ],
				variation: true,
				uid: 'edit_1',
			},
		] };

		const variations = generateVariations( product );

		expect( variations[ 0 ].sku ).to.equal( 'shirt-red-small' );
		expect( variations[ 1 ].sku ).to.equal( 'shirt-blue-small' );
	} );

	it( 'generates a default variation sku without a product name', () => {
		const product = { id: 2, attributes: [
			{
				name: 'Color',
				options: [ 'Red', 'Blue' ],
				variation: true,
				uid: 'edit_0',
			},
			{
				name: 'Size',
				options: [ 'Small' ],
				variation: true,
				uid: 'edit_1',
			},
		] };

		const variations = generateVariations( product );
		expect( variations[ 0 ].sku ).to.equal( 'red-small' );
		expect( variations[ 1 ].sku ).to.equal( 'blue-small' );
	} );
} );
