/**
 * External dependencies
 */
import { expect } from 'chai';
import { set } from 'lodash';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import {
	actionAppendProductVariations,
	handleProductCategoryEdit,
	makeProductActionList,
} from '../';
import {
	WOOCOMMERCE_PRODUCT_CREATE,
	WOOCOMMERCE_PRODUCT_UPDATE,
	WOOCOMMERCE_PRODUCT_VARIATION_CREATE,
	WOOCOMMERCE_PRODUCT_VARIATION_UPDATE,
	WOOCOMMERCE_PRODUCT_VARIATION_DELETE,
	WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
} from 'woocommerce/state/action-types';
import { editProductCategory } from 'woocommerce/state/ui/product-categories/actions';
import {
	editProduct,
	editProductAttribute,
	editProductRemoveCategory,
} from 'woocommerce/state/ui/products/actions';

jest.mock( 'lib/analytics/tracks', () => ( {} ) );

describe( 'handlers', () => {
	describe( '#actionAppendProductVariations', () => {
		const newProduct = {
			id: { index: 0 },
			name: 'New Product',
			attributes: [ { name: 'Color', options: [ 'Black' ], variation: true } ],
		};

		const existingProduct = {
			id: 202,
			name: 'Existing product',
			type: 'variable',
			attributes: [ { name: 'Color', options: [ 'Black' ], variation: true } ],
		};

		const variationBlack = {
			id: 252,
			attributes: [ { id: 0, name: 'Color', option: 'Black' } ],
		};

		const variationBlue = {
			id: 253,
			attributes: [ { id: 1, name: 'Color', option: 'Blue' } ],
		};

		const existingProductAttributes = [ variationBlack, variationBlue ];

		const rootState = {
			extensions: {
				woocommerce: {
					sites: {
						123: {
							productVariations: {
								202: existingProductAttributes,
							},
						},
					},
				},
			},
		};

		test( 'should append product variations to an editProduct action', () => {
			const store = {
				getState: () => rootState,
			};

			const action = editProduct( 123, existingProduct, { name: 'Updated name' } );
			actionAppendProductVariations( store, action );

			expect( action.productVariations ).to.equal( existingProductAttributes );
		} );

		test( 'should append product variations to an editProductAttribute action', () => {
			const store = {
				getState: () => rootState,
			};

			const action = editProductAttribute(
				123,
				existingProduct,
				{ name: 'Color', options: [ 'Black' ], variation: true },
				{ name: 'Color', options: [ 'Blacker' ], variation: true }
			);
			actionAppendProductVariations( store, action );

			expect( action.productVariations ).to.equal( existingProductAttributes );
		} );

		test( 'should, for a newly created product edit, send undefined for the list of product variations', () => {
			const store = {
				getState: () => rootState,
			};

			const action = editProduct( 123, newProduct, { name: 'Updated name' } );
			actionAppendProductVariations( store, action );

			expect( action.productVariations ).to.be.undefined;
		} );
	} );

	describe( '#handleProductCategoryEdit', () => {
		const existingCategory = { id: 101, name: 'Existing Category' };
		const newCategory1 = { id: { placeholder: 'productCategory_1' }, name: 'New Category' };
		const newProduct = {
			id: { index: 0 },
			name: 'New Product',
			categories: [ existingCategory, newCategory1 ],
		};

		const rootState = {
			extensions: {
				woocommerce: {
					ui: {
						productCategories: {
							123: {
								edits: {
									creates: [ newCategory1 ],
								},
							},
						},
						products: {
							123: {
								edits: {
									creates: [ newProduct ],
								},
							},
						},
					},
					sites: {
						123: {
							products: [ newProduct ],
							productCategories: [ existingCategory ],
						},
					},
				},
			},
		};

		test( 'should do nothing if an existing category is updated.', () => {
			const store = {
				dispatch: spy(),
				getState: () => rootState,
			};

			const categoryUpdate = { id: 101, name: 'Updated Category' };
			const action = editProductCategory( 123, existingCategory, categoryUpdate );
			handleProductCategoryEdit( store, action );

			expect( store.dispatch ).to.not.have.been.called;
		} );

		test( 'should add placeholder id to action for a create.', () => {
			const store = {
				dispatch: spy(),
				getState: () => rootState,
			};

			const createId = { placeholder: 'productCategory_2' };
			const newCategory2 = { name: 'Another New Category' };
			const action = editProductCategory( 123, { id: createId }, newCategory2 );
			handleProductCategoryEdit( store, action );

			expect( action.category.id ).to.eql( createId );
			expect( store.dispatch ).to.not.have.been.called;
		} );

		test( 'should remove created category from a product that has it', () => {
			const store = {
				dispatch: spy(),
				getState: () => rootState,
			};

			const action = editProductCategory( 123, newCategory1, null );
			handleProductCategoryEdit( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				editProductRemoveCategory( 123, newProduct, newCategory1.id )
			);
		} );
	} );

	describe( '#makeProductActionList', () => {
		const variationBlackNew = {
			id: { index: 5 },
			attributes: [ { name: 'Color', options: 'Black' } ],
			regular_price: '5.99',
		};
		const variationBlackExisting = {
			id: 202,
			attributes: [ { name: 'Color', options: 'Black' } ],
			regular_price: '5.99',
		};
		const variationBlackEdit = { id: 202, regular_price: '6.99' };

		const existingVariableProduct = {
			id: 42,
			name: 'Product #1',
			type: 'variable',
			attributes: [ { name: 'Color', options: [ 'Black' ], variation: true } ],
		};

		let rootState;

		beforeEach( () => {
			rootState = {
				extensions: {
					woocommerce: {
						ui: {
							products: {
								123: {
									edits: {},
									variations: {
										edits: [],
									},
								},
							},
						},
						sites: {
							123: {
								products: {
									products: [ existingVariableProduct ],
								},
								productVariations: {
									42: [ variationBlackExisting ],
								},
							},
						},
					},
				},
			};
		} );

		test.skip( 'should return null when there are no edits', () => {
			// skipped by blowery because this used to pass due to a bad assertion
			expect( makeProductActionList( null, 123, undefined ) ).to.be.null;
		} );

		test( 'should return a single product create request', () => {
			const product1 = { id: { index: 0 }, name: 'Product #1' };

			const edits = {
				creates: [ product1 ],
			};

			const actionList = makeProductActionList( rootState, 123, edits, [] );
			expect( actionList.nextSteps.length ).to.equal( 1 );

			const dispatch = spy();
			actionList.nextSteps[ 0 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCT_CREATE,
					siteId: 123,
					product: product1,
				} )
					.and( match.has( 'successAction' ) )
					.and( match.has( 'failureAction' ) )
			);
		} );

		test( 'should return multiple product create requests', () => {
			const product1 = { id: { index: 0 }, name: 'Product #1' };
			const product2 = { id: { index: 1 }, name: 'Product #2' };

			const edits = {
				creates: [ product1, product2 ],
			};

			const actionList = makeProductActionList( rootState, 123, edits, [] );
			expect( actionList.nextSteps.length ).to.equal( 2 );

			const dispatch = spy();
			actionList.nextSteps[ 0 ].onStep( dispatch, actionList );
			actionList.nextSteps[ 1 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCT_CREATE,
					siteId: 123,
					product: product1,
				} )
					.and( match.has( 'successAction' ) )
					.and( match.has( 'failureAction' ) )
			);

			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCT_CREATE,
					siteId: 123,
					product: product2,
				} )
					.and( match.has( 'successAction' ) )
					.and( match.has( 'failureAction' ) )
			);
		} );

		test( 'should create an action list with success/failure actions', () => {
			const product1 = { id: { index: 0 }, name: 'Product #1' };

			const edits = {
				creates: [ product1 ],
			};

			const successAction = { type: '%%SUCCESS%%' };
			const onSuccess = ( dispatch ) => dispatch( successAction );

			const failureAction = { type: '%%FAILURE%%' };
			const onFailure = ( dispatch ) => dispatch( failureAction );

			const actionList = makeProductActionList( rootState, 123, edits, [], onSuccess, onFailure );

			const dispatch = spy();
			actionList.onSuccess( dispatch, actionList );
			actionList.onFailure( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith( successAction );
			expect( dispatch ).to.have.been.calledWith( failureAction );
		} );

		test( 'should create only new categories referenced by the products', () => {
			const category1 = {
				id: { placeholder: 'productCategory_1' },
				name: 'Category 1',
				slug: 'category-1',
			};
			const category2 = {
				id: { placeholder: 'productCategory_2' },
				name: 'Unused Category',
				slug: 'unused-category',
			};
			const product1 = {
				id: { index: 0 },
				name: 'Product #1',
				categories: [ { id: category1.id } ],
			};

			const productEdits = {
				creates: [ product1 ],
			};

			const productCategoryEdits = {
				creates: [ category1, category2 ],
			};

			set( rootState.extensions.woocommerce, [ 'ui', 'products', 123, 'edits' ], productEdits );
			set(
				rootState.extensions.woocommerce,
				[ 'ui', 'productCategories', 123, 'edits' ],
				productCategoryEdits
			);

			const actionList = makeProductActionList( rootState, 123, productEdits, [] );
			expect( actionList.nextSteps.length ).to.equal( 2 );

			const dispatch = spy();

			// Create the category
			actionList.nextSteps[ 0 ].onStep( dispatch, actionList );

			// Add the mapping
			actionList.categoryIdMapping = {
				[ 'productCategory_1' ]: 66,
			};

			// Create the product
			actionList.nextSteps[ 1 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
					siteId: 123,
					category: category1,
				} )
			);

			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCT_CREATE,
					siteId: 123,
					product: { ...product1, categories: [ { id: 66 } ] },
				} )
			);
		} );

		test( 'should create variations for a new product', () => {
			const product1 = { id: { placeholder: 0 }, name: 'Product #1', type: 'variable' };

			const productEdits = {
				creates: [ product1 ],
			};

			const variationEdits = [
				{
					productId: { placeholder: 0 },
					creates: [ variationBlackNew ],
				},
			];

			set( rootState.extensions.woocommerce, [ 'ui', 'products', 123, 'edits' ], productEdits );
			set(
				rootState.extensions.woocommerce,
				[ 'ui', 'products', 123, 'variations', 'edits' ],
				variationEdits
			);

			const actionList = makeProductActionList( rootState, 123, productEdits, variationEdits );

			expect( actionList.nextSteps.length ).to.equal( 2 );

			const dispatch = spy();

			// Create the product.
			actionList.nextSteps[ 0 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCT_CREATE,
					siteId: 123,
					product: product1,
				} )
			);

			// Add the mapping
			actionList.productIdMapping = {
				[ 0 ]: 42,
			};

			// Create the variation.
			actionList.nextSteps[ 1 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCT_VARIATION_CREATE,
					siteId: 123,
					productId: 42,
					variation: variationBlackNew,
				} )
			);
		} );

		test( 'should create variations for an existing product', () => {
			const productEdits = rootState.extensions.woocommerce.ui.products[ 123 ].edits;
			const variationEdits = [
				{
					productId: 42,
					creates: [ variationBlackNew ],
				},
			];

			set(
				rootState.extensions.woocommerce,
				[ 'ui', 'products', 123, 'variations', 'edits' ],
				variationEdits
			);

			const actionList = makeProductActionList( rootState, 123, productEdits, variationEdits );

			expect( actionList.nextSteps.length ).to.equal( 1 );

			const dispatch = spy();

			// Create the variation.
			actionList.nextSteps[ 0 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCT_VARIATION_CREATE,
					siteId: 123,
					productId: 42,
					variation: variationBlackNew,
				} )
			);
		} );

		test( 'should update a variation for an existing product', () => {
			const productEdits = rootState.extensions.woocommerce.ui.products[ 123 ].edits;
			const variationEdits = [
				{
					productId: 42,
					updates: [ variationBlackEdit ],
				},
			];

			set(
				rootState.extensions.woocommerce,
				[ 'ui', 'products', 123, 'variations', 'edits' ],
				variationEdits
			);

			const actionList = makeProductActionList( rootState, 123, productEdits, variationEdits );

			expect( actionList.nextSteps.length ).to.equal( 1 );

			const dispatch = spy();

			// Create the variation.
			actionList.nextSteps[ 0 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCT_VARIATION_UPDATE,
					siteId: 123,
					productId: 42,
					variation: variationBlackEdit,
				} )
			);
		} );

		test( 'should delete variations.', () => {
			const productEdits = {
				updates: [ { id: 42, attributes: [] } ],
			};

			const variationEdits = [
				{
					productId: 42,
					deletes: [ variationBlackExisting.id ],
				},
			];

			set( rootState.extensions.woocommerce, [ 'ui', 'products', 123, 'edits' ], productEdits );
			set(
				rootState.extensions.woocommerce,
				[ 'ui', 'products', 123, 'variations', 'edits' ],
				variationEdits
			);

			const actionList = makeProductActionList( rootState, 123, productEdits, variationEdits );

			expect( actionList.nextSteps.length ).to.equal( 2 );

			const dispatch = spy();

			// Update the product.
			actionList.nextSteps[ 0 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCT_UPDATE,
					siteId: 123,
					product: { id: 42, attributes: [] },
				} )
			);

			// Delete the variation.
			actionList.nextSteps[ 1 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCT_VARIATION_DELETE,
					siteId: 123,
					productId: 42,
					variationId: 202,
				} )
			);
		} );
	} );
} );
