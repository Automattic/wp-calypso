/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
import { find, isObject, isFunction, isEqual, compact } from 'lodash';

/**
 * Internal dependencies
 */
// TODO: Remove this when product edits have siteIds.
import { getSelectedSiteId } from 'state/ui/selectors';
import { editProductRemoveCategory } from 'woocommerce/state/ui/products/actions';
import { getAllProductEdits } from 'woocommerce/state/ui/products/selectors';
import { getProduct } from 'woocommerce/state/sites/products/selectors';
import { getAllVariationEdits } from 'woocommerce/state/ui/products/variations/selectors';
import { getAllProductCategoryEdits } from 'woocommerce/state/ui/product-categories/selectors';
import { getVariationsForProduct } from 'woocommerce/state/sites/product-variations/selectors';
import { createProduct, updateProduct } from 'woocommerce/state/sites/products/actions';
import {
	createProductVariation,
	updateProductVariation,
	deleteProductVariation,
} from 'woocommerce/state/sites/product-variations/actions';
import { createProductCategory } from 'woocommerce/state/sites/product-categories/actions';
import {
	actionListStepNext,
	actionListStepSuccess,
	actionListStepFailure,
	actionListClear,
} from 'woocommerce/state/action-list/actions';
import {
	WOOCOMMERCE_PRODUCT_EDIT,
	WOOCOMMERCE_PRODUCT_ATTRIBUTE_EDIT,
	WOOCOMMERCE_PRODUCT_CATEGORY_EDIT,
	WOOCOMMERCE_PRODUCT_ACTION_LIST_CREATE,
} from 'woocommerce/state/action-types';
import { bumpStat } from 'woocommerce/lib/analytics';

export default {
	[ WOOCOMMERCE_PRODUCT_EDIT ]: [ actionAppendProductVariations ],
	[ WOOCOMMERCE_PRODUCT_ATTRIBUTE_EDIT ]: [ actionAppendProductVariations ],
	[ WOOCOMMERCE_PRODUCT_CATEGORY_EDIT ]: [ handleProductCategoryEdit ],
	[ WOOCOMMERCE_PRODUCT_ACTION_LIST_CREATE ]: [ handleProductActionListCreate ],
};

export function actionAppendProductVariations( { getState }, action ) {
	const { siteId } = action;
	const productId = action.product && action.product.id;

	action.productVariations = getVariationsForProduct( getState(), productId, siteId );
}

export function handleProductCategoryEdit( { dispatch, getState }, action ) {
	const rootState = getState();
	const { siteId, category, data } = action;

	if ( null === data ) {
		// It's removing a category from edits.
		const categoryCreates = getAllProductCategoryEdits( rootState, siteId ).creates;
		if ( find( categoryCreates, { id: category.id } ) ) {
			// It's a create, it needs to be removed from any product edits as well.
			const productEdits = getAllProductEdits( rootState, siteId );

			productEdits.creates &&
				productEdits.creates.forEach( ( product ) => {
					dispatch( editProductRemoveCategory( siteId, product, category.id ) );
				} );

			productEdits.updates &&
				productEdits.updates.forEach( ( product ) => {
					dispatch( editProductRemoveCategory( siteId, product, category.id ) );
				} );
		}
	}
}

export function handleProductActionListCreate( store, action ) {
	const { successAction, failureAction } = action;
	const rootState = store.getState();
	const siteId = getSelectedSiteId( rootState );
	const onSuccess = ( dispatch, { updatedProductIds } ) => {
		const products = Object.values( updatedProductIds ).map( ( productId ) =>
			getProduct( store.getState(), productId )
		);
		if ( isFunction( successAction ) ) {
			return dispatch( successAction( products, updatedProductIds ) );
		}
		return dispatch( successAction );
	};
	const onFailure = ( dispatch, { productError } ) => {
		if ( isFunction( failureAction ) ) {
			dispatch( failureAction( productError ) );
		} else {
			dispatch( failureAction );
		}
		dispatch( actionListClear() );
	};
	const actionList = makeProductActionList(
		rootState,
		siteId,
		getAllProductEdits( rootState, siteId ),
		getAllVariationEdits( rootState, siteId ),
		onSuccess,
		onFailure
	);

	store.dispatch( actionListStepNext( actionList ) );
}

/**
 * Makes a product Action List object based on current product edits.
 *
 * For internal and testing use only.
 *
 * @private
 * @param {object} rootState The root calypso state.
 * @param {number} [siteId=selected site] The siteId for the Action List (TODO: Remove this when edits have siteIds.)
 * @param {object} [productEdits=all edits] The product edits to be included in the Action List
 * @param {object} [variationEdits=all edits] The variation edits to be included in the Action List
 * @param {object} [onSuccess] Action to be dispatched upon successful action list completion.
 * @param {object} [onFailure] Action to be dispatched upon failure of action list execution.
 * @returns {object} An Action List object.
 */
export function makeProductActionList(
	rootState,
	siteId,
	productEdits,
	variationEdits,
	onSuccess,
	onFailure
) {
	return {
		nextSteps: [
			...makeProductCategorySteps( rootState, siteId, productEdits ),
			...makeProductSteps( rootState, siteId, productEdits ),
			...makeProductVariationSteps( rootState, siteId, productEdits, variationEdits ),
		],
		onSuccess: ( dispatch, actionList ) => {
			dispatch( onSuccess( dispatch, actionList ) );
			dispatch( actionListClear() );
		},
		onFailure,
	};
}

const categoryCreated = ( actionList ) => ( dispatch, getState, { sentData, receivedData } ) => {
	const categoryIdMapping = {
		...actionList.categoryIdMapping,
		[ sentData.id.placeholder ]: receivedData.id,
	};

	const newActionList = {
		...actionList,
		categoryIdMapping,
	};

	dispatch( actionListStepSuccess( newActionList ) );
};

export function makeProductCategorySteps( rootState, siteId, productEdits ) {
	if ( ! productEdits ) {
		return [];
	}

	const creates = productEdits.creates || [];
	const updates = productEdits.updates || [];
	const categoryEdits = getAllProductCategoryEdits( rootState, siteId );

	// Collect all the IDs of all new categories that are referenced by a product edit.
	const newCategoryIds = getNewCategoryIdsForEdits( [ ...creates, ...updates ] );

	// Construct a step for each new category to be created.
	const createSteps = newCategoryIds.map( ( categoryId ) => {
		const category = find( categoryEdits.creates, { id: categoryId } );

		return {
			description: translate( 'Creating product category: ' ) + category.name,
			onStep: ( dispatch, actionList ) => {
				dispatch(
					createProductCategory(
						siteId,
						category,
						categoryCreated( actionList ),
						actionListStepFailure( actionList )
					)
				);
			},
		};
	} );

	return [ ...createSteps ];
}

function getNewCategoryIdsForEdits( edits ) {
	return edits.reduce( ( categoryIds, product ) => {
		return getCategoryIdsForProduct( product ).filter( ( id ) => {
			return isObject( id ) && categoryIds.indexOf( id ) === -1;
		} );
	}, [] );
}

function getCategoryIdsForProduct( product ) {
	const categories = product.categories || [];

	return categories.map( ( category ) => {
		return category.id;
	} );
}

const variationSuccess = ( actionList, productId ) => ( dispatch ) => {
	const productIds = ( actionList.updatedProductIds && [ ...actionList.updatedProductIds ] ) || [];
	productIds.push( productId );

	const newActionList = {
		...actionList,
		updatedProductIds: productIds,
	};

	dispatch( actionListStepSuccess( newActionList ) );
};

const productSuccess = ( actionList, type ) => (
	dispatch,
	getState,
	{ sentData, receivedData }
) => {
	const productIdMapping = {
		...actionList.productIdMapping,
		[ sentData.id.placeholder || receivedData.id ]: receivedData.id,
	};

	const updatedProductIds =
		( actionList.updatedProductIds && [ ...actionList.updatedProductIds ] ) || [];
	updatedProductIds.push( receivedData.id );

	const newActionList = {
		...actionList,
		productIdMapping,
		updatedProductIds,
	};

	dispatch( bumpStat( 'wpcom-store-products', type + '-calypso' ) );
	dispatch( actionListStepSuccess( newActionList ) );
};

const productFailure = ( actionList ) => ( dispatch, getState, { error } ) => {
	const newActionList = {
		...actionList,
		productError: error,
	};

	dispatch( actionListStepFailure( newActionList ) );
};

export function makeProductSteps( rootState, siteId, productEdits ) {
	if ( ! productEdits ) {
		return [];
	}

	let createSteps = [];
	let updateSteps = [];

	if ( productEdits.creates ) {
		// TODO: Consider making these parallel actions.
		createSteps = productEdits.creates.map( ( product ) => {
			return {
				description: translate( 'Creating product' ),
				onStep: ( dispatch, actionList ) => {
					const { categoryIdMapping } = actionList;

					dispatch(
						createProduct(
							siteId,
							getCorrectedProduct( product, categoryIdMapping ),
							productSuccess( actionList, 'create' ),
							productFailure( actionList )
						)
					);
				},
			};
		} );
	}

	if ( productEdits.updates ) {
		updateSteps = compact(
			productEdits.updates.map( ( product ) => {
				// TODO: When we no longer have to edit a product just to set
				// the currently editing id, remove this.
				if ( isEqual( { id: product.id }, product ) ) {
					return undefined;
				}

				return {
					description: translate( 'Updating product' ),
					onStep: ( dispatch, actionList ) => {
						const { categoryIdMapping } = actionList;

						dispatch(
							updateProduct(
								siteId,
								getCorrectedProduct( product, categoryIdMapping ),
								productSuccess( actionList, 'update' ),
								productFailure( actionList )
							)
						);
					},
				};
			} )
		);
	}

	return [ ...createSteps, ...updateSteps ];
}

function getCorrectedProduct( product, categoryIdMapping ) {
	const { categories } = product;

	if ( categories ) {
		const newCategories = categories.map( ( category ) =>
			getCorrectedCategory( category, categoryIdMapping )
		);

		return {
			...product,
			categories: newCategories,
		};
	}

	return product;
}

function getCorrectedCategory( category, categoryIdMapping ) {
	const updatedId = isObject( category.id ) && categoryIdMapping[ category.id.placeholder ];

	if ( updatedId ) {
		return {
			...category,
			id: updatedId,
		};
	}
	return category;
}

export function makeProductVariationSteps( rootState, siteId, productEdits, variationEdits ) {
	if ( ! variationEdits ) {
		return [];
	}

	let variationCreates = [];
	let variationUpdates = [];
	let variationDeletes = [];

	variationEdits.map( ( { productId, creates, updates, deletes } ) => {
		variationCreates = ( creates || [] ).map( ( variation ) => {
			return variationCreateStep( siteId, productId, variation );
		} );
		variationUpdates = ( updates || [] ).map( ( variation ) => {
			return variationUpdateStep( siteId, productId, variation );
		} );
		variationDeletes = ( deletes || [] ).map( ( variationId ) => {
			return variationDeleteStep( siteId, productId, variationId );
		} );
	} );

	return [ ...variationCreates, ...variationUpdates, ...variationDeletes ];
}

function variationCreateStep( siteId, productId, variation ) {
	return {
		description: translate( 'Creating variation' ),
		onStep: ( dispatch, actionList ) => {
			const newProduct = isObject( productId );
			const realProductId = newProduct
				? actionList.productIdMapping[ productId.placeholder ]
				: productId;

			dispatch(
				createProductVariation(
					siteId,
					realProductId,
					variation,
					variationSuccess( actionList, realProductId ),
					actionListStepFailure( actionList )
				)
			);
		},
	};
}

function variationUpdateStep( siteId, productId, variation ) {
	return {
		description: translate( 'Updating variation' ),
		onStep: ( dispatch, actionList ) => {
			dispatch(
				updateProductVariation(
					siteId,
					productId,
					variation,
					variationSuccess( actionList, productId ),
					actionListStepFailure( actionList )
				)
			);
		},
	};
}

function variationDeleteStep( siteId, productId, variationId ) {
	return {
		description: translate( 'Deleting variation' ),
		onStep: ( dispatch, actionList ) => {
			dispatch(
				deleteProductVariation(
					siteId,
					productId,
					variationId,
					actionListStepSuccess( actionList ),
					actionListStepFailure( actionList )
				)
			);
		},
	};
}
