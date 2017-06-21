/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
// TODO: Remove this when product edits have siteIds.
import { getSelectedSiteId } from 'state/ui/selectors';
import { getAllProductEdits } from 'woocommerce/state/ui/products/selectors';
import { createProduct } from 'woocommerce/state/sites/products/actions';
import {
	actionListCreate,
	actionListStepSuccess,
	actionListStepFailure
} from 'woocommerce/state/action-list/actions';
import {
	WOOCOMMERCE_PRODUCT_ACTION_LIST_CREATE,
} from 'woocommerce/state/action-types';

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
	const steps = [];

	// TODO: sequentially go through edit state and create steps.
	/* TODO: Add category API calls before product.
	...categories.creates
	...categories.updates
	...categories.deletes
	*/

	if ( productEdits && productEdits.creates ) {
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

	/* TODO: Add variation API calls after product.
	...variation.creates
	...variation.updates
	...variation.deletes
	*/

	return { steps, successAction, failureAction, clearUponComplete: true };
}

export default {
	[ WOOCOMMERCE_PRODUCT_ACTION_LIST_CREATE ]: [ handleProductActionListCreate ],
};

