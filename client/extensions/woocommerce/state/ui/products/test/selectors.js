/** @format */
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
	getProductListCurrentPage,
	getProductListProducts,
	getProductListRequestedPage,
	getProductSearchCurrentPage,
	getProductSearchResults,
	getProductSearchRequestedPage,
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
							requestedPage: 3,
							productIds: [ 15, 389 ],
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

const loadedSearchState = {
	extensions: {
		woocommerce: {
			ui: {
				products: {
					123: {
						search: {
							currentPage: 2,
							requestedPage: 3,
							productIds: [ 15, 389 ],
						},
					},
					401: {
						search: {},
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

const loadedSearchStateWithUi = { ...loadedSearchState, ui: { selectedSiteId: 123 } };

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
								search: {},
							},
						},
					},
				},
			},
		};
	} );

	describe( 'getProductEdits', () => {
		it( 'should get a product from "creates"', () => {
			const newProduct = { id: { placeholder: 'product_0' }, name: 'New Product' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'edits', 'creates' ], [ newProduct ] );

			expect( getProductEdits( state, newProduct.id ) ).to.equal( newProduct );
		} );

		it( 'should get a product from "updates"', () => {
			const updateProduct = { id: 1, name: 'Existing Product' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'edits', 'updates' ], [ updateProduct ] );

			expect( getProductEdits( state, updateProduct.id ) ).to.equal( updateProduct );
		} );

		it( 'should return undefined if no edits are found for productId', () => {
			expect( getProductEdits( state, 1 ) ).to.not.exist;
			expect( getProductEdits( state, { placeholder: 'product_9' } ) ).to.not.exist;
		} );
	} );

	describe( 'getProductWithLocalEdits', () => {
		it( 'should get just edits for a product in "creates"', () => {
			const newProduct = { id: { placeholder: 'product_0' }, name: 'New Product' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'edits', 'creates' ], [ newProduct ] );

			expect( getProductWithLocalEdits( state, newProduct.id ) ).to.eql( newProduct );
		} );

		it( 'should get just fetched data for a product that has no edits', () => {
			const productsFromState = state.extensions.woocommerce.sites[ 123 ].products.products;
			expect( getProductWithLocalEdits( state, 1, 123 ) ).to.eql( productsFromState[ 0 ] );
		} );

		it( 'should get both fetched data and edits for a product in "updates"', () => {
			const uiProducts = state.extensions.woocommerce.ui.products;
			const productsFromState = state.extensions.woocommerce.sites[ 123 ].products.products;

			const existingProduct = { id: 1, name: 'Existing Product' };
			set( uiProducts, [ siteId, 'edits', 'updates' ], [ existingProduct ] );

			const combinedProduct = { ...productsFromState[ 0 ], ...existingProduct };
			expect( getProductWithLocalEdits( state, 1 ) ).to.eql( combinedProduct );
		} );

		it( 'should return undefined if no product is found for productId', () => {
			expect( getProductWithLocalEdits( state, 42 ) ).to.not.exist;
			expect( getProductWithLocalEdits( state, { placeholder: 'product_42' } ) ).to.not.exist;
		} );
	} );

	describe( 'getCurrentlyEditingProduct', () => {
		it( 'should return undefined if there are no edits', () => {
			expect( getCurrentlyEditingProduct( state ) ).to.not.exist;
		} );

		it( 'should get the last edited product', () => {
			const newProduct = { id: { placeholder: 'product_0' }, name: 'New Product' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'edits', 'creates' ], [ newProduct ] );
			set( uiProducts, [ siteId, 'edits', 'currentlyEditingId' ], newProduct.id );

			expect( getCurrentlyEditingProduct( state ) ).to.eql( newProduct );
		} );
	} );
	describe( '#getProductListCurrentPage', () => {
		it( 'should be 1 (default) when woocommerce state is not available.', () => {
			expect( getProductListCurrentPage( preInitializedListState, 123 ) ).to.eql( 1 );
		} );

		it( 'should be 1 (default) when products are loading.', () => {
			expect( getProductListCurrentPage( state, 123 ) ).to.eql( 1 );
		} );

		it( 'should be 2, the set page, if the products are loaded.', () => {
			expect( getProductListCurrentPage( loadedListState, 123 ) ).to.eql( 2 );
		} );

		it( 'should be 1 (default) when products are loaded only for a different site.', () => {
			expect( getProductListCurrentPage( loadedListState, 456 ) ).to.eql( 1 );
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getProductListCurrentPage( loadedListStateWithUi ) ).to.eql( 2 );
		} );
	} );
	describe( '#getProductListRequestedPage', () => {
		it( 'should be null (default) when woocommerce state is not available.', () => {
			expect( getProductListRequestedPage( preInitializedListState, 123 ) ).to.be.null;
		} );

		it( 'should be null (default) when products are loading.', () => {
			expect( getProductListRequestedPage( state, 123 ) ).to.be.null;
		} );

		it( 'should be 3, the set requested page, if the products are loaded.', () => {
			expect( getProductListRequestedPage( loadedListState, 123 ) ).to.eql( 3 );
		} );

		it( 'should be null (default) when products are loaded only for a different site.', () => {
			expect( getProductListRequestedPage( loadedListState, 456 ) ).to.be.null;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getProductListRequestedPage( loadedListStateWithUi ) ).to.eql( 3 );
		} );
	} );
	describe( '#getProductListProducts', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( getProductListProducts( preInitializedListState, 123 ) ).to.be.false;
		} );

		it( 'should be false when products are loading.', () => {
			expect( getProductListProducts( state, 123 ) ).to.be.false;
		} );

		it( 'should be the list of products if they are loaded.', () => {
			expect( getProductListProducts( loadedListState, 123 ) ).to.eql( products );
		} );

		it( 'should be false when products are loaded only for a different site.', () => {
			expect( getProductListProducts( loadedListState, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getProductListProducts( loadedListStateWithUi ) ).to.eql( products );
		} );
	} );
	describe( '#getProductSearchCurrentPage', () => {
		it( 'should be 1 (default) when woocommerce state is not available.', () => {
			expect( getProductSearchCurrentPage( preInitializedListState, 123 ) ).to.eql( 1 );
		} );

		it( 'should be 1 (default) when products are loading.', () => {
			expect( getProductSearchCurrentPage( state, 123 ) ).to.eql( 1 );
		} );

		it( 'should be 2, the set page, if the products are loaded.', () => {
			expect( getProductSearchCurrentPage( loadedSearchState, 123 ) ).to.eql( 2 );
		} );

		it( 'should be 1 (default) when products are loaded only for a different site.', () => {
			expect( getProductSearchCurrentPage( loadedSearchState, 456 ) ).to.eql( 1 );
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getProductSearchCurrentPage( loadedSearchStateWithUi ) ).to.eql( 2 );
		} );
	} );
	describe( '#getProductSearchRequestedPage', () => {
		it( 'should be null (default) when woocommerce state is not available.', () => {
			expect( getProductSearchRequestedPage( preInitializedListState, 123 ) ).to.be.null;
		} );

		it( 'should be null (default) when products are loading.', () => {
			expect( getProductSearchRequestedPage( state, 123 ) ).to.be.null;
		} );

		it( 'should be 3, the set requested page, if the products are loaded.', () => {
			expect( getProductSearchRequestedPage( loadedSearchState, 123 ) ).to.eql( 3 );
		} );

		it( 'should be null (default) when products are loaded only for a different site.', () => {
			expect( getProductSearchRequestedPage( loadedSearchState, 456 ) ).to.be.null;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getProductSearchRequestedPage( loadedSearchStateWithUi ) ).to.eql( 3 );
		} );
	} );
	describe( '#getProductSearchResults', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( getProductSearchResults( preInitializedListState, 123 ) ).to.be.false;
		} );

		it( 'should be false when products are loading.', () => {
			expect( getProductSearchResults( state, 123 ) ).to.be.false;
		} );

		it( 'should be the list of products if they are loaded.', () => {
			expect( getProductSearchResults( loadedSearchState, 123 ) ).to.eql( products );
		} );

		it( 'should be false when products are loaded only for a different site.', () => {
			expect( getProductSearchResults( loadedSearchState, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getProductSearchResults( loadedSearchStateWithUi ) ).to.eql( products );
		} );
	} );
} );
