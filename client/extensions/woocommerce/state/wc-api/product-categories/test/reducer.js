/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import handlers from '../reducer';
import {
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES,
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS,
} from '../../../action-types';
import { fetchProductCategoriesSuccess } from '../actions';

describe( 'productCategoriesGet', () => {
	it( 'should not change any state', () => {
		const siteData = {};
		const handler = handlers[ WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES ];

		expect( handler ).to.exist;

		const newSiteData = handler( siteData, { type: WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES, siteId: 123 } );
		expect( newSiteData ).to.equal( siteData );
	} );
} );

describe( 'productCategoriesGetSuccess', () => {
	it( 'should store data from the action', () => {
		const siteData = {};
		const handler = handlers[ WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS ];

		expect( handler ).to.exist;

		const categories = [
			{ name: 'cat1' },
			{ name: 'cat2' },
		];
		const newSiteData = handler( siteData, fetchProductCategoriesSuccess( 123, categories ) );
		expect( newSiteData ).to.exist;
		expect( newSiteData.productCategories ).to.equal( categories );
	} );
} );

