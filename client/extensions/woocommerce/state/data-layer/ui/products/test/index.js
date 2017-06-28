/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { handleProductCategoryEdit, makeProductActionList, } from '../';
import { actionListStepSuccess, actionListStepFailure } from 'woocommerce/state/action-list/actions';
import { createProduct } from 'woocommerce/state/sites/products/actions';
import { editProductRemoveCategory } from 'woocommerce/state/ui/products/actions';
import { editProductCategory } from 'woocommerce/state/ui/product-categories/actions';

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
			expect( makeProductActionList( null, 123, null ) ).to.equal.null;
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

			const action1 = createProduct(
				123,
				product1,
				actionListStepSuccess( 0 ),
				actionListStepFailure( 0, 'UNKNOWN' )
			);

			const expectedActionList = {
				steps: [
					{ description: 'Creating product: Product #1', action: action1 },
				],
				successAction: undefined,
				failureAction: undefined,
				clearUponComplete: true,
			};

			expect( makeProductActionList( rootState, 123, edits ) ).to.eql( expectedActionList );
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

			const action1 = createProduct(
				123,
				product1,
				actionListStepSuccess( 0 ),
				actionListStepFailure( 0, 'UNKNOWN' )
			);

			const action2 = createProduct(
				123,
				product2,
				actionListStepSuccess( 1 ),
				actionListStepFailure( 1, 'UNKNOWN' )
			);

			const expectedActionList = {
				steps: [
					{ description: 'Creating product: Product #1', action: action1 },
					{ description: 'Creating product: Product #2', action: action2 },
				],
				successAction: undefined,
				failureAction: undefined,
				clearUponComplete: true,
			};

			expect( makeProductActionList( rootState, 123, edits ) ).to.eql( expectedActionList );
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

			const action1 = createProduct(
				123,
				product1,
				actionListStepSuccess( 0 ),
				actionListStepFailure( 0, 'UNKNOWN' )
			);

			const successAction = { type: '%%SUCCESS%%' };
			const failureAction = { type: '%%FAILURE%%' };

			const expectedActionList = {
				steps: [
					{ description: 'Creating product: Product #1', action: action1 },
				],
				successAction,
				failureAction,
				clearUponComplete: true,
			};

			const actionList = makeProductActionList( rootState, 123, edits, successAction, failureAction );
			expect( actionList ).to.eql( expectedActionList );
		} );
	} );
} );

