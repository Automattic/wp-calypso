/**
 * External dependencies
 */
import { expect } from 'chai';
import { set } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getProductEdits,
	getProductWithLocalEdits,
	getCurrentlyEditingProduct,
	getProductsCurrentPage,
	getProductsCurrentSearch,
	getProductsRequestedPage,
	getProductsRequestedSearch,
} from '../selectors';
import products from 'woocommerce/state/sites/products/test/fixtures/products';

const siteId = 123;

const preInitializedListState = {
	extensions: {
		woocommerce: {},
	},
};

const loadedListState = {
	extensions: {
		woocommerce: {
			ui: {
				products: {
					123: {
						list: {
							currentPage: 2,
							currentSearch: 'example',
							requestedPage: 3,
							requestedSearch: 'test',
						},
					},
					401: {
						list: {},
					},
				},
			},
			sites: {
				123: {
					products: {
						products,
					},
				},
				401: {
					products: {
						products: {},
					},
				},
			},
		},
	},
};

const loadedListStateWithUi = { ...loadedListState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	let state;

	beforeEach( () => {
		state = {
			ui: { selectedSiteId: 123 },
			extensions: {
				woocommerce: {
					sites: {
						123: {
							products: {
								products: [ { id: 1, type: 'simple', name: 'Product 1' } ],
							},
						},
					},
					ui: {
						products: {
							123: {
								list: {},
							},
						},
					},
				},
			},
		};
	} );

	describe( 'getProductEdits', () => {
		test( 'should get a product from "creates"', () => {
			const newProduct = { id: { placeholder: 'product_0' }, name: 'New Product' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'edits', 'creates' ], [ newProduct ] );

			expect( getProductEdits( state, newProduct.id ) ).to.equal( newProduct );
		} );

		test( 'should get a product from "updates"', () => {
			const updateProduct = { id: 1, name: 'Existing Product' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'edits', 'updates' ], [ updateProduct ] );

			expect( getProductEdits( state, updateProduct.id ) ).to.equal( updateProduct );
		} );

		test( 'should return undefined if no edits are found for productId', () => {
			expect( getProductEdits( state, 1 ) ).to.not.exist;
			expect( getProductEdits( state, { placeholder: 'product_9' } ) ).to.not.exist;
		} );
	} );

	describe( 'getProductWithLocalEdits', () => {
		test( 'should get just edits for a product in "creates"', () => {
			const newProduct = { id: { placeholder: 'product_0' }, name: 'New Product' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'edits', 'creates' ], [ newProduct ] );

			expect( getProductWithLocalEdits( state, newProduct.id ) ).to.eql( newProduct );
		} );

		test( 'should get just fetched data for a product that has no edits', () => {
			const productsFromState = state.extensions.woocommerce.sites[ 123 ].products.products;
			expect( getProductWithLocalEdits( state, 1, 123 ) ).to.eql( productsFromState[ 0 ] );
		} );

		test( 'should get both fetched data and edits for a product in "updates"', () => {
			const uiProducts = state.extensions.woocommerce.ui.products;
			const productsFromState = state.extensions.woocommerce.sites[ 123 ].products.products;

			const existingProduct = { id: 1, name: 'Existing Product' };
			set( uiProducts, [ siteId, 'edits', 'updates' ], [ existingProduct ] );

			const combinedProduct = { ...productsFromState[ 0 ], ...existingProduct };
			expect( getProductWithLocalEdits( state, 1 ) ).to.eql( combinedProduct );
		} );

		test( 'should return undefined if no product is found for productId', () => {
			expect( getProductWithLocalEdits( state, 42 ) ).to.not.exist;
			expect( getProductWithLocalEdits( state, { placeholder: 'product_42' } ) ).to.not.exist;
		} );
	} );

	describe( 'getCurrentlyEditingProduct', () => {
		test( 'should return undefined if there are no edits', () => {
			expect( getCurrentlyEditingProduct( state ) ).to.not.exist;
		} );

		test( 'should get the last edited product', () => {
			const newProduct = { id: { placeholder: 'product_0' }, name: 'New Product' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'edits', 'creates' ], [ newProduct ] );
			set( uiProducts, [ siteId, 'edits', 'currentlyEditingId' ], newProduct.id );

			expect( getCurrentlyEditingProduct( state ) ).to.eql( newProduct );
		} );
	} );

	describe( '#getProductsCurrentPage', () => {
		test( 'should be 1 (default) when woocommerce state is not available.', () => {
			expect( getProductsCurrentPage( preInitializedListState, 123 ) ).to.eql( 1 );
		} );

		test( 'should be 1 (default) when products are loading.', () => {
			expect( getProductsCurrentPage( state, 123 ) ).to.eql( 1 );
		} );

		test( 'should be 2, the set page, if the products are loaded.', () => {
			expect( getProductsCurrentPage( loadedListState, 123 ) ).to.eql( 2 );
		} );

		test( 'should be 1 (default) when products are loaded only for a different site.', () => {
			expect( getProductsCurrentPage( loadedListState, 456 ) ).to.eql( 1 );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getProductsCurrentPage( loadedListStateWithUi ) ).to.eql( 2 );
		} );
	} );

	describe( '#getProductsCurrentSearch', () => {
		test( 'should be 1 (default) when woocommerce state is not available.', () => {
			expect( getProductsCurrentSearch( preInitializedListState, 123 ) ).to.eql( '' );
		} );

		test( 'should be 1 (default) when products are loading.', () => {
			expect( getProductsCurrentSearch( state, 123 ) ).to.eql( '' );
		} );

		test( 'should be 2, the set page, if the products are loaded.', () => {
			expect( getProductsCurrentSearch( loadedListState, 123 ) ).to.eql( 'example' );
		} );

		test( 'should be 1 (default) when products are loaded only for a different site.', () => {
			expect( getProductsCurrentSearch( loadedListState, 456 ) ).to.eql( '' );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getProductsCurrentSearch( loadedListStateWithUi ) ).to.eql( 'example' );
		} );
	} );

	describe( '#getProductsRequestedPage', () => {
		test( 'should be null (default) when woocommerce state is not available.', () => {
			expect( getProductsRequestedPage( preInitializedListState, 123 ) ).to.be.null;
		} );

		test( 'should be null (default) when products are loading.', () => {
			expect( getProductsRequestedPage( state, 123 ) ).to.be.null;
		} );

		test( 'should be 3, the set requested page, if the products are loaded.', () => {
			expect( getProductsRequestedPage( loadedListState, 123 ) ).to.eql( 3 );
		} );

		test( 'should be null (default) when products are loaded only for a different site.', () => {
			expect( getProductsRequestedPage( loadedListState, 456 ) ).to.be.null;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getProductsRequestedPage( loadedListStateWithUi ) ).to.eql( 3 );
		} );
	} );

	describe( '#getProductsRequestedSearch', () => {
		test( 'should be null (default) when woocommerce state is not available.', () => {
			expect( getProductsRequestedSearch( preInitializedListState, 123 ) ).to.be.null;
		} );

		test( 'should be null (default) when products are loading.', () => {
			expect( getProductsRequestedSearch( state, 123 ) ).to.be.null;
		} );

		test( 'should be 3, the set requested page, if the products are loaded.', () => {
			expect( getProductsRequestedSearch( loadedListState, 123 ) ).to.eql( 'test' );
		} );

		test( 'should be null (default) when products are loaded only for a different site.', () => {
			expect( getProductsRequestedSearch( loadedListState, 456 ) ).to.be.null;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getProductsRequestedSearch( loadedListStateWithUi ) ).to.eql( 'test' );
		} );
	} );
} );
