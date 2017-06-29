/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { handleProductCategoryEdit, makeProductActionList, } from '../';
import { actionListStepSuccess, actionListStepFailure } from 'woocommerce/state/action-list/actions';
import { createProduct } from 'woocommerce/state/sites/products/actions';
import { editProductRemoveCategory } from 'woocommerce/state/ui/products/actions';
import { editProductCategory } from 'woocommerce/state/ui/product-categories/actions';
import {
	WOOCOMMERCE_PRODUCT_CREATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
} from 'woocommerce/state/action-types';

describe( 'handlers', () => {
	describe( '#handleProductCategoryEdit', () => {
		const existingCategory = { id: 101, name: 'Existing Category' };
		const newCategory1 = { id: { placeholder: 'productCategory_1' }, name: 'New Category' };
		const newProduct = {
			id: { index: 0 },
			name: 'Existing Product',
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
								}
							}
						},
						products: {
							123: {
								edits: {
									creates: [ newProduct ],
								}
							}
						},
					},
					sites: {
						123: {
							products: [ newProduct ],
							productCategories: [ existingCategory ],
						}
					},
				}
			}
		};

		it( 'should do nothing if an existing category is updated.', () => {
			const store = {
				dispatch: spy(),
				getState: () => rootState,
			};

			const categoryUpdate = { id: 101, name: 'Updated Category' };
			const action = editProductCategory( 123, existingCategory, categoryUpdate );
			handleProductCategoryEdit( store, action );

			expect( store.dispatch ).to.not.have.been.called;
		} );

		it( 'should add placeholder id to action for a create.', () => {
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

		it( 'should remove created category from a product that has it', () => {
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
		it( 'should return null when there are no edits', () => {
			expect( makeProductActionList( null, 123, undefined ) ).to.equal.null;
		} );

		it( 'should return a single product create request', () => {
			const rootState = {
				extensions: {
					woocommerce: {
					}
				}
			};

			const product1 = { id: { index: 0 }, name: 'Product #1' };

			const edits = {
				creates: [
					product1,
				]
			};

			const actionList = makeProductActionList( rootState, 123, edits );
			expect( actionList.nextSteps.length ).to.equal( 1 );

			const dispatch = spy();
			actionList.nextSteps[ 0 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith( createProduct(
				123,
				product1,
				actionListStepSuccess( actionList ),
				actionListStepFailure( actionList )
			) );
		} );

		it( 'should return multiple product create requests', () => {
			const rootState = {
				extensions: {
					woocommerce: {
					}
				}
			};

			const product1 = { id: { index: 0 }, name: 'Product #1' };
			const product2 = { id: { index: 1 }, name: 'Product #2' };

			const edits = {
				creates: [
					product1,
					product2,
				]
			};

			const actionList = makeProductActionList( rootState, 123, edits );
			expect( actionList.nextSteps.length ).to.equal( 2 );

			const dispatch = spy();
			actionList.nextSteps[ 0 ].onStep( dispatch, actionList );
			actionList.nextSteps[ 1 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith( createProduct(
				123,
				product1,
				actionListStepSuccess( actionList ),
				actionListStepFailure( actionList ),
			) );

			expect( dispatch ).to.have.been.calledWith( createProduct(
				123,
				product2,
				actionListStepSuccess( actionList ),
				actionListStepFailure( actionList ),
			) );
		} );

		it( 'should create an action list with success/failure actions', () => {
			const rootState = {
				extensions: {
					woocommerce: {
					}
				}
			};

			const product1 = { id: { index: 0 }, name: 'Product #1' };

			const edits = {
				creates: [
					product1,
				]
			};

			const successAction = { type: '%%SUCCESS%%' };
			const onSuccess = ( dispatch ) => dispatch( successAction );

			const failureAction = { type: '%%FAILURE%%' };
			const onFailure = ( dispatch ) => dispatch( failureAction );

			const actionList = makeProductActionList( rootState, 123, edits, onSuccess, onFailure );

			const dispatch = spy();
			actionList.onSuccess( dispatch, actionList );
			actionList.onFailure( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith( successAction );
			expect( dispatch ).to.have.been.calledWith( failureAction );
		} );

		it( 'should create only new categories referenced by the products', () => {
			const category1 = { id: { placeholder: 'productCategory_1' }, name: 'Category 1', slug: 'category-1' };
			const category2 = { id: { placeholder: 'productCategory_2' }, name: 'Unused Category', slug: 'unused-category' };
			const product1 = { id: { index: 0 }, name: 'Product #1', categories: [ { id: category1.id } ] };

			const rootState = {
				extensions: {
					woocommerce: {
						ui: {
							products: {
								123: {
									edits: {
										creates: [
											product1,
										]
									}
								},
							},
							productCategories: {
								123: {
									edits: {
										creates: [
											category1,
											category2,
										],
									}
								},
							},
						},
					}
				}
			};

			const edits = rootState.extensions.woocommerce.ui.products[ 123 ].edits;
			const actionList = makeProductActionList( rootState, 123, edits );
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

			expect( dispatch ).to.have.been.calledWith( match( {
				type: WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
				siteId: 123,
				category: category1,
			} ) );

			expect( dispatch ).to.have.been.calledWith( match( {
				type: WOOCOMMERCE_PRODUCT_CREATE,
				siteId: 123,
				product: { ...product1, categories: [ { id: 66 } ] },
			} ) );
		} );
	} );
} );

