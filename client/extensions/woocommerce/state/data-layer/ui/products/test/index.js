/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { actionAppendProductVariations, handleProductCategoryEdit, makeProductActionList, } from '../';
import { actionListStepFailure } from 'woocommerce/state/action-list/actions';
import { editProduct, editProductAttribute, editProductRemoveCategory } from 'woocommerce/state/ui/products/actions';
import { editProductCategory } from 'woocommerce/state/ui/product-categories/actions';
import {
	WOOCOMMERCE_PRODUCT_CREATE,
	WOOCOMMERCE_PRODUCT_VARIATION_CREATE,
	WOOCOMMERCE_PRODUCT_VARIATION_UPDATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
} from 'woocommerce/state/action-types';

describe( 'handlers', () => {
	describe( '#actionAppendProductVariations', () => {
		const newProduct = {
			id: { index: 0 },
			name: 'New Product',
			attributes: [
				{ name: 'Color', options: [ 'Black' ], variation: true },
			],
		};

		const existingProduct = {
			id: 202,
			name: 'Existing product',
			type: 'variable',
			attributes: [
				{ name: 'Color', options: [ 'Black' ], variation: true },
			],
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
							}
						}
					},
				}
			}
		};

		it( 'should append product variations to an editProduct action', () => {
			const store = {
				getState: () => rootState,
			};

			const action = editProduct( 123, existingProduct, { name: 'Updated name' } );
			actionAppendProductVariations( store, action );

			expect( action.productVariations ).to.equal( existingProductAttributes );
		} );

		it( 'should append product variations to an editProductAttribute action', () => {
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

		it( 'should, for a newly created product edit, send undefined for the list of product variations', () => {
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

			const actionList = makeProductActionList( rootState, 123, edits, [] );
			expect( actionList.nextSteps.length ).to.equal( 1 );

			const dispatch = spy();
			actionList.nextSteps[ 0 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith( match( {
				type: WOOCOMMERCE_PRODUCT_CREATE,
				siteId: 123,
				product: product1,
				failureAction: actionListStepFailure( actionList ),
			} ).and( match.has( 'successAction' ) ) );
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

			const actionList = makeProductActionList( rootState, 123, edits, [] );
			expect( actionList.nextSteps.length ).to.equal( 2 );

			const dispatch = spy();
			actionList.nextSteps[ 0 ].onStep( dispatch, actionList );
			actionList.nextSteps[ 1 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith( match( {
				type: WOOCOMMERCE_PRODUCT_CREATE,
				siteId: 123,
				product: product1,
				failureAction: actionListStepFailure( actionList ),
			} ).and( match.has( 'successAction' ) ) );

			expect( dispatch ).to.have.been.calledWith( match( {
				type: WOOCOMMERCE_PRODUCT_CREATE,
				siteId: 123,
				product: product2,
				failureAction: actionListStepFailure( actionList ),
			} ).and( match.has( 'successAction' ) ) );
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

			const actionList = makeProductActionList( rootState, 123, edits, [], onSuccess, onFailure );

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
			const actionList = makeProductActionList( rootState, 123, edits, [] );
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

		it( 'should create variations for a new product', () => {
			const product1 = { id: { index: 0 }, name: 'Product #1', type: 'variable' };
			const variationBlack = { id: { index: 4 }, attributes: [ { name: 'Color', options: 'Black' } ] };

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
									},
									variations: {
										edits: [
											{
												productId: { index: 0 },
												creates: [
													variationBlack,
												]
											}
										]
									}
								},
							},
						}
					}
				}
			};

			const productEdits = rootState.extensions.woocommerce.ui.products[ 123 ].edits;
			const variationEdits = rootState.extensions.woocommerce.ui.products[ 123 ].variations.edits;
			const actionList = makeProductActionList( rootState, 123, productEdits, variationEdits );

			expect( actionList.nextSteps.length ).to.equal( 2 );

			const dispatch = spy();

			// Create the product.
			actionList.nextSteps[ 0 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith( match( {
				type: WOOCOMMERCE_PRODUCT_CREATE,
				siteId: 123,
				product: product1,
			} ) );

			// Add the mapping
			actionList.productIdMapping = {
				[ 0 ]: 42,
			};

			// Create the variation.
			actionList.nextSteps[ 1 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith( match( {
				type: WOOCOMMERCE_PRODUCT_VARIATION_CREATE,
				siteId: 123,
				productId: 42,
				variation: variationBlack,
			} ) );
		} );

		it( 'should create variations for an existing product', () => {
			const product1 = { id: 42, name: 'Product #1', type: 'variable' };
			const variationBlack = { id: 202, sku: 'old-sku', attributes: [ { name: 'Color', options: 'Black' } ] };

			const rootState = {
				extensions: {
					woocommerce: {
						ui: {
							products: {
								123: {
									edits: {
									},
									variations: {
										edits: [
											{
												productId: 42,
												creates: [
													variationBlack,
												]
											}
										]
									}
								},
							},
						},
						sites: {
							123: {
								products: {
									products: [
										product1,
									]
								},
								productVariations: { },
							}
						},
					}
				}
			};

			const productEdits = rootState.extensions.woocommerce.ui.products[ 123 ].edits;
			const variationEdits = rootState.extensions.woocommerce.ui.products[ 123 ].variations.edits;
			const actionList = makeProductActionList( rootState, 123, productEdits, variationEdits );

			expect( actionList.nextSteps.length ).to.equal( 1 );

			const dispatch = spy();

			// Create the variation.
			actionList.nextSteps[ 0 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith( match( {
				type: WOOCOMMERCE_PRODUCT_VARIATION_CREATE,
				siteId: 123,
				productId: 42,
				variation: variationBlack,
			} ) );
		} );

		it( 'should update a variation for an existing product', () => {
			const product1 = { id: 42, name: 'Product #1', type: 'variable' };
			const variationBlack = { id: 202, sku: 'old-sku', attributes: [ { name: 'Color', options: 'Black' } ] };
			const variationBlackEdit = { id: 202, sku: 'new-sku' };

			const rootState = {
				extensions: {
					woocommerce: {
						ui: {
							products: {
								123: {
									edits: {
									},
									variations: {
										edits: [
											{
												productId: 42,
												updates: [
													variationBlackEdit,
												]
											}
										]
									}
								},
							},
						},
						sites: {
							123: {
								products: {
									products: [
										product1,
									]
								},
								productVariations: {
									42: [
										variationBlack,
									]
								},
							}
						},
					}
				}
			};

			const productEdits = rootState.extensions.woocommerce.ui.products[ 123 ].edits;
			const variationEdits = rootState.extensions.woocommerce.ui.products[ 123 ].variations.edits;
			const actionList = makeProductActionList( rootState, 123, productEdits, variationEdits );

			expect( actionList.nextSteps.length ).to.equal( 1 );

			const dispatch = spy();

			// Create the variation.
			actionList.nextSteps[ 0 ].onStep( dispatch, actionList );

			expect( dispatch ).to.have.been.calledWith( match( {
				type: WOOCOMMERCE_PRODUCT_VARIATION_UPDATE,
				siteId: 123,
				productId: 42,
				variation: variationBlackEdit,
			} ) );
		} );
	} );
} );

