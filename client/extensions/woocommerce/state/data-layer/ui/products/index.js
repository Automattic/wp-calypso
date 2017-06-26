/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { find, isObject } from 'lodash';

/**
 * Internal dependencies
 */
// TODO: Remove this when product edits have siteIds.
import { getSelectedSiteId } from 'state/ui/selectors';
import { editProductRemoveCategory } from 'woocommerce/state/ui/products/actions';
import { getAllProductEdits } from 'woocommerce/state/ui/products/selectors';
import { getVariationEditsStateForProduct } from 'woocommerce/state/ui/products/variations/selectors';
import { getAllProductCategoryEdits } from 'woocommerce/state/ui/product-categories/selectors';
import { createProduct } from 'woocommerce/state/sites/products/actions';
import { createProductVariation } from 'woocommerce/state/sites/product-variations/actions';
import { createProductCategory } from 'woocommerce/state/sites/product-categories/actions';
import {
	actionListStepNext,
	actionListStepSuccess,
	actionListStepFailure,
	actionListClear,
} from 'woocommerce/state/action-list/actions';
import {
	WOOCOMMERCE_PRODUCT_CATEGORY_EDIT,
	WOOCOMMERCE_PRODUCT_ACTION_LIST_CREATE,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_PRODUCT_CATEGORY_EDIT ]: [ handleProductCategoryEdit ],
	[ WOOCOMMERCE_PRODUCT_ACTION_LIST_CREATE ]: [ handleProductActionListCreate ],
};

export function handleProductCategoryEdit( { dispatch, getState }, action ) {
	const rootState = getState();
	const { siteId, category, data } = action;

	if ( null === data ) {
		// It's removing a category from edits.
		const categoryCreates = getAllProductCategoryEdits( rootState, siteId ).creates;
		if ( find( categoryCreates, { id: category.id } ) ) {
			// It's a create, it needs to be removed from any product edits as well.
			const productEdits = getAllProductEdits( rootState, siteId );

			productEdits.creates && productEdits.creates.forEach( ( product ) => {
				dispatch( editProductRemoveCategory( siteId, product, category.id ) );
			} );

			productEdits.updates && productEdits.updates.forEach( ( product ) => {
				dispatch( editProductRemoveCategory( siteId, product, category.id ) );
			} );
		}
	}
}

export function handleProductActionListCreate( store, action ) {
	const { successAction, failureAction } = action;

	const onSuccess = ( dispatch ) => dispatch( successAction );
	const onFailure = ( dispatch ) => {
		dispatch( failureAction );
		dispatch( actionListClear() );
	};
	const actionList = makeProductActionList( store.getState(), undefined, undefined, onSuccess, onFailure );

	store.dispatch( actionListStepNext( actionList ) );
}

/**
 * Makes a product Action List object based on current product edits.
 *
 * For internal and testing use only.
 * @private
 * @param {Object} rootState The root calypso state.
 * @param {Number} [siteId=selected site] The siteId for the Action List (TODO: Remove this when edits have siteIds.)
 * @param {Object} [productEdits=all edits] The product edits to be included in the Action List
 * @param {Object} [successAction] Action to be dispatched upon successful action list completion.
 * @param {Object} [failureAction] Action to be dispatched upon failure of action list execution.
 * @return {Object} An Action List object.
 */
export function makeProductActionList(
	rootState,
	siteId = getSelectedSiteId( rootState ),
	productEdits = getAllProductEdits( rootState, siteId ),
	onSuccess,
	onFailure,
) {
	return {
		nextSteps: [
			...makeProductCategorySteps( rootState, siteId, productEdits ),
			...makeProductSteps( rootState, siteId, productEdits ),
			...makeProductVariationSteps( rootState, siteId, productEdits ),
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
				dispatch( createProductCategory(
					siteId,
					category,
					categoryCreated( actionList ),
					actionListStepFailure( actionList ),
				) );
			},
		};
	} );

	return [
		...createSteps,
		// TODO: ...updateSteps,
		// TODO: ...deleteSteps,
	];
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

const productCreated = ( actionList ) => ( dispatch, getState, { sentData, receivedData } ) => {
	const productIdMapping = {
		...actionList.productIdMapping,
		[ sentData.id.index ]: receivedData.id,
	};

	const newActionList = {
		...actionList,
		productIdMapping,
	};

	dispatch( actionListStepSuccess( newActionList ) );
};

export function makeProductSteps( rootState, siteId, productEdits ) {
	let createSteps = [];

	if ( productEdits.creates ) {
		// TODO: Consider making these parallel actions.
		createSteps = productEdits.creates.map( ( product ) => {
			return {
				description: translate( 'Creating product: ' ) + product.name,
				onStep: ( dispatch, actionList ) => {
					const { categoryIdMapping } = actionList;

					dispatch( createProduct(
						siteId,
						getCorrectedProduct( product, categoryIdMapping ),
						productCreated( actionList ),
						actionListStepFailure( actionList ),
					) );
				},
			};
		} );
	}

	return [
		...createSteps,
		// TODO: ...updateSteps,
		// TODO: ...deleteSteps,
	];
}

function getCorrectedProduct( product, categoryIdMapping ) {
	const { categories } = product;

	if ( categories ) {
		const newCategories = categories.map(
			( category ) => getCorrectedCategory( category, categoryIdMapping ) );

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

export function makeProductVariationSteps( rootState, siteId, productEdits ) {
	const creates = productEdits.creates || [];
	let productCreateVariationCreates = [];

	creates && creates.forEach( ( product ) => {
		if ( 'variable' !== product.type ) {
			return;
		}

		const variationEdits = getVariationEditsStateForProduct( rootState, product.id, siteId );
		productCreateVariationCreates = ( variationEdits.creates || [] ).map( ( variation ) => {
			return {
				description: translate( 'Creating variations for product: ' ) + product.name,
				onStep: ( dispatch, actionList ) => {
					const { productIdMapping } = actionList;
					const correctedProductId = productIdMapping[ product.id.index ];

					dispatch( createProductVariation(
						siteId,
						correctedProductId,
						variation,
						actionListStepSuccess( actionList ),
						actionListStepFailure( actionList ),
					) );
				},
			};
		} );
	} );

	return [
		...productCreateVariationCreates,
		// TODO: ...productUpdateVariationCreates,
		// TODO: ...productUpdateVariationUpdates,
		// TODO: ...productUpdateVariationDeletes,
	];
}

