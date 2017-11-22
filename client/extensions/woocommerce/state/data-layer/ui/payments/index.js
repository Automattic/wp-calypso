/** @format */

/**
 * External dependencies
 */

import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { WOOCOMMERCE_PAYMENT_ACTION_LIST_CREATE } from 'woocommerce/state/action-types';
import { actionListStepNext, actionListClear } from 'woocommerce/state/action-list/actions';
import { getSaveSettingsActionListSteps } from './reducer';

export default {
	[ WOOCOMMERCE_PAYMENT_ACTION_LIST_CREATE ]: [
		/**
		 * Creates and executes a payments settings action list
		 * @param {Object} store -
		 * @param {Object} action - an action containing successAction and failureAction
		 */
		( store, action ) => {
			const { successAction, failureAction } = action;

			/**
			 * A callback issued after a successful request
			 * @param {Function} dispatch - dispatch function
			 */
			const onSuccess = dispatch => {
				dispatch( successAction( dispatch ) );
				dispatch( actionListClear() );
			};
			/**
			 * A callback issued after a failed request
			 * @param {Function} dispatch - dispatch function
			 */
			const onFailure = dispatch => {
				dispatch( failureAction );
				dispatch( actionListClear() );
			};
			const nextSteps = getSaveSettingsActionListSteps( store.getState() );

			store.dispatch(
				isEmpty( nextSteps ) ? onSuccess : actionListStepNext( { nextSteps, onSuccess, onFailure } )
			);
		},
	],
};
