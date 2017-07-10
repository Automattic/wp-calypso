/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { isEmpty, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PAYMENT_ACTION_LIST_CREATE,
} from 'woocommerce/state/action-types';
import {
	actionListStepNext,
	actionListStepSuccess,
	actionListStepFailure,
	actionListClear,
} from 'woocommerce/state/action-list/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { areSettingsGeneralLoaded, getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';
import { getCurrencyWithEdits } from 'woocommerce/state/ui/payments/currency/selectors';
import { saveCurrency } from 'woocommerce/state/sites/settings/general/actions';
import { getPaymentMethods, arePaymentMethodsLoaded } from 'woocommerce/state/sites/payment-methods/selectors';
import { savePaymentMethod } from 'woocommerce/state/sites/payment-methods/actions';
import { getPaymentMethodsWithEdits } from 'woocommerce/state/ui/payments/methods/selectors';

const getSaveCurrencySteps = ( state, siteId ) => {
	if ( ! areSettingsGeneralLoaded( state, siteId ) ) {
		return [];
	}

	const serverCurrencySettings = getPaymentCurrencySettings( state, siteId );
	const clientCurrency = getCurrencyWithEdits( state, siteId );
	if ( serverCurrencySettings && serverCurrencySettings.value && serverCurrencySettings.value === clientCurrency ) {
		return [];
	}

	return [ {
		description: translate( 'Saving currency' ),
		onStep: ( dispatch, actionList ) => {
			dispatch( saveCurrency(
				siteId,
				clientCurrency,
				actionListStepSuccess( actionList ),
				actionListStepFailure( actionList ),
			) );
		},
	} ];
};

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
				dispatch( savePaymentMethod(
					siteId,
					clientMethod,
					actionListStepSuccess( actionList ),
					actionListStepFailure( actionList ),
				) );
			}
		} );
	} );

	return actions;
};

const getSaveSettingsActionListSteps = ( state ) => {
	const siteId = getSelectedSiteId( state );

	return [
		...getSaveCurrencySteps( state, siteId ),
		...getSavePaymentMethodsSteps( state, siteId ),
	];
};

export default {
	[ WOOCOMMERCE_PAYMENT_ACTION_LIST_CREATE ]: [
		( store, action ) => {
			const { successAction, failureAction } = action;

			const onSuccess = ( dispatch ) => {
				dispatch( successAction );
				dispatch( actionListClear() );
			};
			const onFailure = ( dispatch ) => {
				dispatch( failureAction );
				dispatch( actionListClear() );
			};
			const nextSteps = getSaveSettingsActionListSteps( store.getState() );

			store.dispatch( isEmpty( nextSteps ) ? onSuccess : actionListStepNext( { nextSteps, onSuccess, onFailure } ) );
		}
	],
};
