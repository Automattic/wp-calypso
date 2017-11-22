/** @format */

/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */

import {
	actionListStepSuccess,
	actionListStepFailure,
} from 'woocommerce/state/action-list/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	areSettingsGeneralLoaded,
	getPaymentCurrencySettings,
} from 'woocommerce/state/sites/settings/general/selectors';
import { getCurrencyWithEdits } from 'woocommerce/state/ui/payments/currency/selectors';
import { saveCurrency } from 'woocommerce/state/sites/settings/general/actions';
import {
	getPaymentMethods,
	arePaymentMethodsLoaded,
} from 'woocommerce/state/sites/payment-methods/selectors';
import { savePaymentMethod } from 'woocommerce/state/sites/payment-methods/actions';
import { getPaymentMethodsWithEdits } from 'woocommerce/state/ui/payments/methods/selectors';

/**
* Creates a list of actions required to save the currency settings.
* @param {Object} state - Redux state
* @param {Number} siteId - site ID
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
* @param {Object} state - Redux state
* @param {Number} siteId - site ID
* @returns {Array} - actions required to save each payment method, or an empty array
*/
const getSavePaymentMethodsSteps = ( state, siteId ) => {
	if ( ! arePaymentMethodsLoaded( state, siteId ) ) {
		return [];
	}

	const actions = [];
	const serverMethods = getPaymentMethods( state, siteId );
	const clientMethods = getPaymentMethodsWithEdits( state, siteId );

	serverMethods.forEach( ( serverMethod, index ) => {
		//todo: creates and deletes when we support them
		const clientMethod = clientMethods[ index ];
		if ( isEqual( serverMethod, clientMethod ) ) {
			return;
		}

		actions.push( {
			description: translate( 'Saving method: %s', { args: [ serverMethod.id ] } ),
			onStep: ( dispatch, actionList ) => {
				dispatch(
					savePaymentMethod(
						siteId,
						clientMethod,
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
* @param {Object} state - Redux state
* @returns {Array} - action list steps
*/
const getSaveSettingsActionListSteps = state => {
	const siteId = getSelectedSiteId( state );

	return [
		...getSaveCurrencySteps( state, siteId ),
		...getSavePaymentMethodsSteps( state, siteId ),
	];
};

export default getSaveSettingsActionListSteps;
