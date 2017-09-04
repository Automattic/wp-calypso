/**
 * External dependencies
 */
import { createSelector } from 'reselect'; // TODO refactor to use lib/create-selector and uninstall reselect
import _ from 'lodash';

/**
 * Internal dependencies
 */
import { hasNonEmptyLeaves } from 'woocommerce/woocommerce-services/lib/utils/tree';
import getErrors from './errors';

export default createSelector(
	getErrors,
	( state ) => state.shippingLabel.form,
	( errors, form ) => (
		! _.isEmpty( form ) &&
		! hasNonEmptyLeaves( errors ) &&
		! form.origin.normalizationInProgress &&
		! form.destination.normalizationInProgress &&
		! form.rates.retrievalInProgress &&
		! _.isEmpty( form.rates.available )
	)
);
