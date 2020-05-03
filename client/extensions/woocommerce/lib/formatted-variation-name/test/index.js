/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import formattedVariationName from '../index';

describe( 'formattedVariationName', () => {
	test( 'returns correctly when passed corrupt attributes data array', () => {
		const malformedVariant = {
			id: 100,
			visible: true,
			attributes: [ 'foo', null ],
		};

		const name = formattedVariationName( malformedVariant, 'All Variations' );
		expect( name ).to.eql( ' - ' );
	} );
	test( 'returns default when passed single null variation', () => {
		const malformedVariant = {
			id: 100,
			visible: true,
			attributes: [ null ],
		};

		const name = formattedVariationName( malformedVariant, '' );
		expect( name ).to.eql( '' );
	} );
	test( 'returns fallback when passed a variation with no attributes', () => {
		const variation = {
			id: 1,
			visible: true,
		};
		const name = formattedVariationName( variation, 'All Variations' );
		expect( name ).to.eql( 'All Variations' );
	} );
	test( 'returns fallback when passed a variation with empty attributes', () => {
		const variation = {
			id: 1,
			visible: true,
			attributes: [],
		};
		const name = formattedVariationName( variation, 'All Variations' );
		expect( name ).to.eql( 'All Variations' );
	} );
	test( 'returns simple name when passed a variation with one attribute', () => {
		const variation = {
			id: 1,
			visible: true,
			attributes: [
				{
					name: 'Color',
					option: 'Red',
				},
			],
		};
		const name = formattedVariationName( variation );
		expect( name ).to.eql( 'Red' );
	} );
	test( 'returns name containing all attribute options when passed a variation with multiple attributes', () => {
		const variation = {
			id: 1,
			visible: true,
			attributes: [
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
					option: 'Short Sleeves',
				},
			],
		};
		const name = formattedVariationName( variation );
		expect( name ).to.eql( 'Red - Small - Short Sleeves' );
	} );
} );
