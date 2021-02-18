/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import generateVariations from '../index';

describe( 'generateVariations', () => {
	test( 'returns an empty array when passed a product with no attributes', () => {
		const product = { id: 1 };
		const variations = generateVariations( product );
		expect( variations ).to.eql( [] );
	} );
	test( 'returns an empty array when passed a product with non-variation attributes', () => {
		const product = {
			id: 1,
			attributes: [
				{
					name: 'Test Attribute',
					options: [ 'Option' ],
					variation: false,
					uid: 'edit_0',
				},
			],
		};
		const variations = generateVariations( product );
		expect( variations ).to.eql( [] );
	} );
	test( 'generates simple variations when passed a product with one product variation attribute', () => {
		const product = {
			id: 1,
			attributes: [
				{
					name: 'Color',
					options: [ 'Red', 'Blue' ],
					variation: true,
					uid: 'edit_0',
				},
			],
		};

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
	test( 'generates a cartesian of variations when passed a product with multiple variation attributes', () => {
		const product = {
			id: 1,
			attributes: [
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
			],
		};

		const variations = generateVariations( product );

		expect( variations[ 0 ].attributes ).to.eql( [
			{
				name: 'Color',
				option: 'Red',
			},
			{
				name: 'Size',
				option: 'Small',
			},
		] );

		expect( variations[ 1 ].attributes ).to.eql( [
			{
				name: 'Color',
				option: 'Blue',
			},
			{
				name: 'Size',
				option: 'Small',
			},
		] );
	} );
	test( 'generates a complex cartesian of variations when passed a product with multiple attributes and options', () => {
		const product = {
			id: 1,
			attributes: [
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
			],
		};

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

	test( 'generates a default variation sku with product name', () => {
		const product = {
			id: 1,
			name: 'Shirt',
			attributes: [
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
			],
		};

		const variations = generateVariations( product );

		expect( variations[ 0 ].sku ).to.equal( 'shirt-red-small' );
		expect( variations[ 1 ].sku ).to.equal( 'shirt-blue-small' );
	} );

	test( 'generates a default variation sku without a product name', () => {
		const product = {
			id: 2,
			attributes: [
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
			],
		};

		const variations = generateVariations( product );
		expect( variations[ 0 ].sku ).to.equal( 'red-small' );
		expect( variations[ 1 ].sku ).to.equal( 'blue-small' );
	} );

	test( 'copies id and sku from existing product variations, where available', () => {
		const product = {
			id: 2,
			attributes: [
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
			],
		};

		const productVariations = [
			{
				id: 25,
				sku: 'its-red-and-small',
				attributes: [
					{ id: 0, name: 'Color', option: 'Red' },
					{ id: 1, name: 'Size', option: 'Small' },
				],
			},
			{
				sku: 'its-blue-and-small',
				attributes: [
					{ id: 2, name: 'Color', option: 'Blue' },
					{ id: 1, name: 'Size', option: 'Small' },
				],
			},
		];

		const variations = generateVariations( product, productVariations );

		expect( variations[ 0 ].id ).to.equal( 25 );
		expect( variations[ 0 ].sku ).to.equal( 'its-red-and-small' );
		expect( variations[ 0 ].attributes[ 0 ].id ).to.equal( 0 );
		expect( variations[ 0 ].attributes[ 1 ].id ).to.equal( 1 );
		expect( variations[ 1 ].id ).to.not.exist;
		expect( variations[ 1 ].sku ).to.equal( 'its-blue-and-small' );
		expect( variations[ 1 ].attributes[ 0 ].id ).to.equal( 2 );
		expect( variations[ 1 ].attributes[ 1 ].id ).to.equal( 1 );
	} );
} );
