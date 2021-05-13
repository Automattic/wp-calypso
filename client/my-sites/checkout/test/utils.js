/**
 * External dependencies
 */
import configureStore from 'redux-mock-store';

/**
 * Internal dependencies
 */
import { getDomainOrProductFromContext } from '../utils';

const mockStore = configureStore();

describe( 'getDomainOrProductFromContext', () => {
	const siteId = 1;
	const siteSlug = 'example.com';
	const newDomain = 'mydomain.com';
	const newProduct = 'jetpack-product';
	const store = mockStore( {
		ui: {
			selectedSiteId: siteId,
		},
		sites: {
			items: {
				[ siteId ]: {
					slug: siteSlug,
				},
			},
		},
	} );

	it( "should return the `domainOrProduct` parameter if it's not the selected site slug", () => {
		const product = getDomainOrProductFromContext( {
			store,
			params: {
				domainOrProduct: newDomain,
			},
		} );

		expect( product ).toEqual( newDomain );
	} );

	it( 'should return the `product` parameter if `domainOrProduct` is the selected site slug', () => {
		const product = getDomainOrProductFromContext( {
			store,
			params: {
				domainOrProduct: siteSlug,
				product: newProduct,
			},
		} );

		expect( product ).toEqual( newProduct );
	} );

	it( "should return the `product` parameter if there's no selected site", () => {
		const product = getDomainOrProductFromContext( {
			store: mockStore( {
				ui: {},
			} ),
			params: {
				product: newProduct,
			},
		} );

		expect( product ).toEqual( newProduct );
	} );

	it( "should return the `product` parameter if there's no `domainOrProduct` parameter", () => {
		const product = getDomainOrProductFromContext( {
			store,
			params: {
				product: newProduct,
			},
		} );

		expect( product ).toEqual( newProduct );
	} );
} );
