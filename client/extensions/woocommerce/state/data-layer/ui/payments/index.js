/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { WOOCOMMERCE_PAYMENT_ACTION_LIST_CREATE } from 'woocommerce/state/action-types';
import {
	actionListStepNext,
	actionListStepSuccess,
	actionListStepFailure,
	actionListClear,
} from 'woocommerce/state/action-list/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	areSettingsGeneralLoaded,
	getPaymentCurrencySettings,
} from 'woocommerce/state/sites/settings/general/selectors';
import { getCurrencyWithEdits } from 'woocommerce/state/ui/payments/currency/selectors';
import { saveCurrency } from 'woocommerce/state/sites/settings/general/actions';
import { arePaymentMethodsLoaded } from 'woocommerce/state/sites/payment-methods/selectors';
import { savePaymentMethod } from 'woocommerce/state/sites/payment-methods/actions';
import { getPaymentMethodsEdits } from 'woocommerce/state/ui/payments/methods/selectors';

/**
 * Creates a list of actions required to save the currency settings.
 *
 * @param {object} state - Redux state
 * @param {number} siteId - site ID
 * @returns {Array} - actions required to save the currency, or an empty array
 */
const getSaveCurrencySteps = ( state, siteId ) => {
	if ( ! areSettingsGeneralLoaded( state, siteId ) ) {
		return [];
	}

	const serverCurrencySettings = getPaymentCurrencySettings( state, siteId );
	const clientCurrency = getCurrencyWithEdits( state, siteId );
	if (
		serverCurrencySettings &&
		serverCurrencySettings.value &&
		serverCurrencySettings.value === clientCurrency
	) {
		return [];
	}

	return [
		{
			description: translate( 'Saving currency' ),
			onStep: ( dispatch, actionList ) => {
				dispatch(
					saveCurrency(
						siteId,
						clientCurrency,
						actionListStepSuccess( actionList ),
						actionListStepFailure( actionList )
					)
				);
			},
		},
	];
};

/**
 * Creates a list of actions required to save each payment method. Checks if the methods have changed before saving them
 *
 * @param {object} state - Redux state
 * @param {number} siteId - site ID
 * @returns {Array} - actions required to save each payment method, or an empty array
 */
const getSavePaymentMethodsSteps = ( state, siteId ) => {
	if ( ! arePaymentMethodsLoaded( state, siteId ) ) {
		return [];
	}

	const actions = [];
	const edits = getPaymentMethodsEdits( state, siteId );

	if ( ! edits || ! edits.updates ) {
		return [];
	}

	edits.updates.forEach( ( update ) => {
		const { id, ...settings } = update;

		const method = {
			id,
			settings,
		};

		actions.push( {
			description: translate( 'Saving method: %s', { args: [ id ] } ),
			onStep: ( dispatch, actionList ) => {
				dispatch(
					savePaymentMethod(
						siteId,
						method,
						actionListStepSuccess( actionList ),
						actionListStepFailure( actionList )
					)
				);
			},
		} );
	} );

	return actions;
};

/**
 * Creates a list of all actions required to save the payment settings
 *
 * @param {object} state - Redux state
 * @returns {Array} - action list steps
 */
const getSaveSettingsActionListSteps = ( state ) => {
	const siteId = getSelectedSiteId( state );

	return [
		...getSaveCurrencySteps( state, siteId ),
		...getSavePaymentMethodsSteps( state, siteId ),
	];
};

export default {
	[ WOOCOMMERCE_PAYMENT_ACTION_LIST_CREATE ]: [
		/**
		 * Creates and executes a payments settings action list
		 *
		 * @param {object} store -
		 * @param {object} action - an action containing successAction and failureAction
		 */
		( store, action ) => {
			const { successAction, failureAction } = action;

			/**
			 * A callback issued after a successful request
			 *
			 * @param {Function} dispatch - dispatch function
			 */
			const onSuccess = ( dispatch ) => {
				dispatch( successAction( dispatch ) );
				dispatch( actionListClear() );
			};
			/**
			 * A callback issued after a failed request
			 *
			 * @param {Function} dispatch - dispatch function
			 */
			const onFailure = ( dispatch ) => {
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
