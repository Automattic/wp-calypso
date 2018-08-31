/** @format */

/**
 * External dependencies
 */

import { isEmpty, uniqBy, reduce } from 'lodash';
import { translate } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import { WOOCOMMERCE_SHIPPING_CLASSES_ACTION_LIST_CREATE } from 'woocommerce/state/action-types';
import {
	actionListStepNext,
	actionListStepSuccess,
	actionListStepFailure,
	actionListClear,
} from 'woocommerce/state/action-list/actions';
import { getUiShippingClassesState } from 'woocommerce/state/ui/shipping/classes/selectors';
import {
	deleteShippingClass,
	createShippingClass,
	updateShippingClass,
} from 'woocommerce/state/sites/shipping-classes/actions';

/**
 * Creates a list of all steps that are required in order to save the shipping classes.
 *
 * @param  {object} state  The existing state.
 * @param  {number} siteId The ID of the site to manipulate.
 * @return {Object[]}	   All required steps for the list.
 */
const getSaveShippingClassesActionListSteps = ( state, siteId ) => {
	const localState = getUiShippingClassesState( state, siteId );
	const list = [];
	const { created, deleted } = localState;

	// Once an update gets applied, it will be removed from the array
	let { updates } = localState;

	// Add all deletions as actions
	deleted.forEach( id => {
		// Newly created classes have a 'temp-' prefix and are not in the DB yet.
		if ( 'string' === typeof id ) {
			return;
		}

		list.push( {
			description: translate( 'Deleting a shipping class' ),
			action: deleteShippingClass,
			args: [ id ],
		} );
	} );

	// Add all newly created classes as actions
	created.forEach( id => {
		// Ensure that the class has not been deleted yet
		if ( -1 !== deleted.indexOf( id ) ) {
			return;
		}

		let shippingClass = { id };

		updates = updates.filter( changeset => {
			if ( id !== changeset.id ) {
				return true;
			}

			shippingClass = {
				...shippingClass,
				...changeset,
			};

			return false;
		} );

		list.push( {
			description: translate( 'Creating a shipping class' ),
			action: createShippingClass,
			args: [ id, shippingClass ],
		} );
	} );

	// Combine all updates
	uniqBy( updates, 'id' ).forEach( ( { id } ) => {
		// Ensure that the class has not been deleted yet
		if ( -1 !== deleted.indexOf( id ) ) {
			return;
		}

		const allChanges = reduce(
			updates,
			( changes, changeset ) => {
				return id !== changeset.id
					? changes
					: {
							...changes,
							...changeset,
					  };
			},
			{}
		);

		// Ensure that the changes object only contains actual data
		delete allChanges.id;

		list.push( {
			description: translate( 'Updating a shipping class' ),
			action: updateShippingClass,
			args: [ id, allChanges ],
		} );
	} );

	// Convert the basic list to a proper action list
	return list.map( ( { action, args, description } ) => ( {
		description,
		onStep: ( dispatch, actionList ) => {
			const actionObj = action(
				siteId,
				...args,
				() => dispatch( actionListStepSuccess( actionList ) ),
				() => dispatch( actionListStepFailure( actionList ) )
			);

			dispatch( actionObj );
		},
	} ) );
};

export default {
	[ WOOCOMMERCE_SHIPPING_CLASSES_ACTION_LIST_CREATE ]: [
		/**
		 * Creates and executes a WCS shipping settings action list
		 * @param {Object} store  The store that is being mainpulated.
		 * @param {Object} action An action containing successAction and failureAction.
		 */
		( store, action ) => {
			const { successAction, failureAction, siteId } = action;

			/**
			 * A callback issued after a successful request
			 * @param {Function} dispatch Dispatch function
			 */
			const onSuccess = dispatch => {
				dispatch( successAction );
				dispatch( actionListClear() );
			};

			/**
			 * A callback issued after a failed request
			 * @param {Function} dispatch Dispatch function
			 */
			const onFailure = dispatch => {
				dispatch( failureAction );
				dispatch( actionListClear() );
			};

			const nextSteps = getSaveShippingClassesActionListSteps( store.getState(), siteId );

			store.dispatch(
				isEmpty( nextSteps ) ? onSuccess : actionListStepNext( { nextSteps, onSuccess, onFailure } )
			);
		},
	],
};
