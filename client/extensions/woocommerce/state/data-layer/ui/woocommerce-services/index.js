/**
 * External dependencies
 */

import { isEmpty } from 'lodash';
import { translate } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import { WOOCOMMERCE_SERVICES_SHIPPING_ACTION_LIST_CREATE } from 'woocommerce/state/action-types';
import {
	actionListStepNext,
	actionListStepSuccess,
	actionListStepFailure,
	actionListClear,
} from 'woocommerce/state/action-list/actions';
import {
	areLabelsEnabled,
	getLabelSettingsFormMeta,
	getSelectedPaymentMethodId,
} from 'woocommerce/woocommerce-services/state/label-settings/selectors';
import { getPackagesForm } from 'woocommerce/woocommerce-services/state/packages/selectors';
import { submit as submitLabels } from 'woocommerce/woocommerce-services/state/label-settings/actions';
import { submit as submitPackages } from 'woocommerce/woocommerce-services/state/packages/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_UPDATE } from 'woocommerce/woocommerce-services/state/action-types';
import { shippingZoneMethodUpdated } from 'woocommerce/state/sites/shipping-zone-methods/actions';
import * as api from 'woocommerce/woocommerce-services/api';
import { dispatchWithProps } from 'woocommerce/state/helpers';
import { getShippingMethodSchema } from 'woocommerce/woocommerce-services/state/shipping-method-schemas/selectors';
import coerceFormValues from 'woocommerce/woocommerce-services/lib/utils/coerce-values';

const getSaveLabelSettingsActionListSteps = ( state, siteId ) => {
	const labelFormMeta = getLabelSettingsFormMeta( state, siteId );
	if (
		! labelFormMeta ||
		labelFormMeta.pristine ||
		( ! labelFormMeta.can_edit_settings && labelFormMeta.can_manage_payments )
	) {
		return [];
	}

	return [
		{
			description: translate( 'Saving label settings' ),
			onStep: ( dispatch, actionList ) => {
				dispatch(
					submitLabels(
						siteId,
						() => dispatch( actionListStepSuccess( actionList ) ),
						() => dispatch( actionListStepFailure( actionList ) )
					)
				);
			},
		},
	];
};

const getSavePackagesActionListSteps = ( state, siteId ) => {
	const packagesForm = getPackagesForm( state, siteId );
	if ( ! packagesForm || packagesForm.pristine ) {
		return [];
	}

	return [
		{
			description: translate( 'Saving label settings' ),
			onStep: ( dispatch, actionList ) => {
				dispatch(
					submitPackages(
						siteId,
						() => dispatch( actionListStepSuccess( actionList ) ),
						() => dispatch( actionListStepFailure( actionList ) )
					)
				);
			},
		},
	];
};

const getSaveSettingsActionListSteps = ( state ) => {
	const siteId = getSelectedSiteId( state );

	return [
		...getSaveLabelSettingsActionListSteps( state, siteId ),
		...getSavePackagesActionListSteps( state, siteId ),
	];
};

export default {
	[ WOOCOMMERCE_SERVICES_SHIPPING_ACTION_LIST_CREATE ]: [
		/**
		 * Creates and executes a WCS shipping settings action list
		 *
		 * @param {object} store -
		 * @param {object} action - an action containing successAction and failureAction
		 */
		( store, action ) => {
			const { successAction, failureAction, noLabelsPaymentAction } = action;

			const state = store.getState();
			if ( areLabelsEnabled( state ) && ! getSelectedPaymentMethodId( state ) ) {
				store.dispatch( noLabelsPaymentAction );
				return;
			}

			/**
			 * A callback issued after a successful request
			 *
			 * @param {Function} dispatch - dispatch function
			 */
			const onSuccess = ( dispatch ) => {
				dispatch( successAction );
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

	[ WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_UPDATE ]: [
		( { dispatch, getState }, action ) => {
			const { siteId, methodId, methodType, method, successAction, failureAction } = action;
			const methodSchema = getShippingMethodSchema( getState(), methodType, siteId ).formSchema;
			const methodValues = coerceFormValues( methodSchema, method );

			const updatedAction = ( data ) => {
				dispatch( shippingZoneMethodUpdated( siteId, data, action ) );

				const props = {
					sentData: methodValues,
					receivedData: data,
				};
				dispatchWithProps( dispatch, getState, successAction, props );
			};

			api
				.post( siteId, api.url.serviceSettings( methodType, methodId ), methodValues )
				.then( updatedAction )
				.catch( ( error ) => dispatchWithProps( dispatch, getState, failureAction, { error } ) );
		},
	],
};
