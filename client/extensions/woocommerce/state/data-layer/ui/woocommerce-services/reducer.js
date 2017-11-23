/** @format */

/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import {
	actionListStepSuccess,
	actionListStepFailure,
} from 'woocommerce/state/action-list/actions';
import { getLabelSettingsFormMeta } from 'woocommerce/woocommerce-services/state/label-settings/selectors';
import { getPackagesForm } from 'woocommerce/woocommerce-services/state/packages/selectors';
import { submit as submitLabels } from 'woocommerce/woocommerce-services/state/label-settings/actions';
import { submit as submitPackages } from 'woocommerce/woocommerce-services/state/packages/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

const getSaveLabelSettingsActionListSteps = ( state, siteId ) => {
	const labelFormMeta = getLabelSettingsFormMeta( state, siteId );
	if ( ! labelFormMeta || labelFormMeta.pristine || ! labelFormMeta.can_manage_payments ) {
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

const getSaveSettingsActionListSteps = state => {
	const siteId = getSelectedSiteId( state );

	return [
		...getSaveLabelSettingsActionListSteps( state, siteId ),
		...getSavePackagesActionListSteps( state, siteId ),
	];
};

export default getSaveSettingsActionListSteps;
