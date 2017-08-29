/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { customPostToProduct, productToCustomPost } from '../';

describe( '#simplePayments', () => {
	it( 'should convert customPost to product', () => {
		const customPost = {
			type: 'jp_pay_product',
			ID: 1,
			title: 'The Button',
			content: 'A very nice button for sale',
			featured_image: 2,
			metadata: [
				{ key: 'spay_price', value: 100 },
				{ key: 'spay_currency', value: 'EUR' },
				{ key: 'spay_multiple', value: '0' },
				{ key: 'spay_bogus', value: 'ignore' },
			],
		};

		const product = {
			ID: 1,
			title: 'The Button',
			description: 'A very nice button for sale',
			featuredImageId: 2,
			price: 100,
			currency: 'EUR',
			multiple: false,
		};

		const convertedProduct = customPostToProduct( customPost );
		expect( convertedProduct ).to.deep.equal( product );
	} );

	it( 'should decode special characters when converting to product', () => {
		const customPost = {
			ID: 2,
			title: '\u201d\u221e\u201d and &#8216;so much more&#8217;\u2122 \u2026',
			content: 'Accepting $, \u20bf, &amp; \u2603',
			featured_image: 2,
			metadata: [
				{ key: 'spay_price', value: 100 },
				{ key: 'spay_currency', value: 'EUR' },
				{ key: 'spay_multiple', value: '0' },
				{ key: 'spay_bogus', value: 'ignore' },
			],
		};
		const convertedProduct = customPostToProduct( customPost );

		expect( convertedProduct.title ).to.equal( '”∞” and ‘so much more’™ …' );
		expect( convertedProduct.description ).to.equal( 'Accepting $, ₿, & ☃' );
	} );

	it( 'should convert product to customPost', () => {
		const product = {
			ID: 1,
			title: 'The Button',
			description: 'A very nice button for sale',
			featuredImageId: 2,
			price: 100,
			currency: 'USD',
			multiple: true,
		};

		const customPost = {
			type: 'jp_pay_product',
			title: 'The Button',
			content: 'A very nice button for sale',
			featured_image: 2,
			metadata: [
				{ key: 'spay_price', value: 100 },
				{ key: 'spay_currency', value: 'USD' },
				{ key: 'spay_multiple', value: 1 },
				{ key: 'spay_formatted_price', value: '$100.00' },
			],
		};

		const convertedCustomPost = productToCustomPost( product );
		expect( convertedCustomPost ).to.deep.equal( customPost );
	} );
} );
