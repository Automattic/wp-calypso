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
import { getAllProductCategoryEdits } from 'woocommerce/state/ui/product-categories/selectors';
import { createProduct } from 'woocommerce/state/sites/products/actions';
import { createProductCategory } from 'woocommerce/state/sites/product-categories/actions';
import {
	actionListCreate,
	actionListStepSuccess,
	actionListStepFailure
} from 'woocommerce/state/action-list/actions';
import {
	WOOCOMMERCE_PRODUCT_CATEGORY_EDIT,
	WOOCOMMERCE_PRODUCT_ACTION_LIST_CREATE,
} from 'woocommerce/state/action-types';

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

export function handleProductActionListCreate( { dispatch, getState }, action ) {
	const { successAction, failureAction } = action;
	const actionList = makeProductActionList( getState(), undefined, undefined, successAction, failureAction );

	dispatch( actionListCreate( actionList ) );
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
	successAction,
	failureAction,
) {
	let steps = [];

	if ( productEdits ) {
		steps = makeProductCategorySteps( steps, rootState, siteId, productEdits );
		steps = makeProductSteps( steps, rootState, siteId, productEdits );
		// TODO: variations
		//steps = makeProductVariationSteps( steps, rootState, siteId, productEdits );
	}

	return { steps, successAction, failureAction, clearUponComplete: true };
}

export function makeProductCategorySteps( allSteps, rootState, siteId, productEdits ) {
	const steps = [ ...allSteps ];

	const creates = productEdits.creates || [];
	const updates = productEdits.updates || [];
	const allProductEdits = [ ...creates, ...updates ];

	const newCategoryIds = allProductEdits.reduce( ( categoryIds, product ) => {
		const categories = product.categories || [];

		return categories.reduce( ( productCategoryIds, category ) => {
			return ( isObject( category.id ) ? productCategoryIds.add( category.id ) : productCategoryIds );
		}, categoryIds );
	}, new Set() );

	const categoryEdits = getAllProductCategoryEdits( rootState, siteId );
	newCategoryIds.forEach( ( categoryId ) => {
		const category = find( categoryEdits.creates, ( c ) => categoryId === c.id );
		const stepIndex = steps.length;
		const description = translate( 'Creating product category: ' ) + category.name;
		const action = createProductCategory(
			siteId,
			category,
			actionListStepSuccess( stepIndex ),
			actionListStepFailure( stepIndex, 'UNKNOWN' ) // error will be set by request failure.
		);
		steps.push( { description, action } );
	} );

	/* TODO:
	...categories.updates
	...categories.deletes
	*/

	return steps;
}

export function makeProductSteps( allSteps, rootState, siteId, productEdits ) {
	const steps = [ ...allSteps ];

	if ( productEdits.creates ) {
		// Each create gets its own step.
		// TODO: Consider making these parallel actions.
		productEdits.creates.forEach( ( product ) => {
			const stepIndex = steps.length;
			const description = translate( 'Creating product: ' ) + product.name;

			const action = createProduct(
				siteId,
				product,
				actionListStepSuccess( stepIndex ),
				actionListStepFailure( stepIndex, 'UNKNOWN' ) // error will be set by request failure.
			);

			steps.push( { description, action } );
		} );
	}

	/* TODO: Add updates and deletes
	...product.updates
	...product.deletes
	*/

	return steps;
}

/*
export function makeProductVariationSteps( allSteps, rootState, siteId, productEdits ) {
	const steps = [ ...allSteps ];

	// TODO: ...variation.creates
	// TODO: ...variation.updates
	// TODO: ...variation.deletes

	return steps;
}
*/

export default {
	[ WOOCOMMERCE_PRODUCT_CATEGORY_EDIT ]: [ handleProductCategoryEdit ],
	[ WOOCOMMERCE_PRODUCT_ACTION_LIST_CREATE ]: [ handleProductActionListCreate ],
};

