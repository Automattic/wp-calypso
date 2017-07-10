/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { isEmpty } from 'lodash';

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
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';
import { getCurrencyWithEdits } from 'woocommerce/state/ui/payments/currency/selectors';
import { saveCurrency } from 'woocommerce/state/sites/settings/general/actions';

const getSaveCurrencySteps = ( state, siteId ) => {
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

const getSaveSettingsActionListSteps = ( state ) => {
	const siteId = getSelectedSiteId( state );

	return [
		...getSaveCurrencySteps( state, siteId ),
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