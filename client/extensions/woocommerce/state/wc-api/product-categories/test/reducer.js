/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import handlers from '../reducer';
import {
	WOOCOMMERCE_API_PRODUCT_CATEGORIES_GET,
	WOOCOMMERCE_API_PRODUCT_CATEGORIES_GET_SUCCESS,
} from '../../../action-types';
import { getProductCategoriesSuccess } from '../actions';

describe( 'productCategoriesGet', () => {
	it( 'should not change any state', () => {
		const siteData = {};
		const handler = handlers[ WOOCOMMERCE_API_PRODUCT_CATEGORIES_GET ];

		expect( handler ).to.exist;

		const newSiteData = handler( siteData, { type: WOOCOMMERCE_API_PRODUCT_CATEGORIES_GET, siteId: 123 } );
		expect( newSiteData ).to.equal( siteData );
	} );
} );

describe( 'productCategoriesGetSuccess', () => {
	it( 'should store data from the action', () => {
		const siteData = {};
		const handler = handlers[ WOOCOMMERCE_API_PRODUCT_CATEGORIES_GET_SUCCESS ];

		expect( handler ).to.exist;

		const categories = [
			{ name: 'cat1' },
			{ name: 'cat2' },
		];
		const newSiteData = handler( siteData, getProductCategoriesSuccess( 123, categories ) );
		expect( newSiteData ).to.exist;
		expect( newSiteData.productCategories ).to.equal( categories );
	} );
} );

