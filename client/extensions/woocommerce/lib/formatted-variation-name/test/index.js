/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import formattedVariationName from '../index';

describe( 'formattedVariationName', () => {
	it( 'returns fallback when passed a variation with no attributes', () => {
		const variation = {
			id: 1,
			visible: true,
		};
		const name = formattedVariationName( variation, 'All Variations' );
		expect( name ).to.eql( 'All Variations' );
	} );
	it( 'returns fallback when passed a variation with empty attributes', () => {
		const variation = {
			id: 1,
			visible: true,
			attributes: [],
		};
		const name = formattedVariationName( variation, 'All Variations' );
		expect( name ).to.eql( 'All Variations' );
	} );
	it( 'returns simple name when passed a variation with one attribute', () => {
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
	it( 'returns name containing all attribute options when passed a variation with multiple attributes', () => {
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
