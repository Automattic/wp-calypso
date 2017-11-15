/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';
/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

export const getLabelSettingsForm = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'woocommerceServices', siteId, 'labelSettings' ],
		null
	);
};

export const getLabelSettingsFormData = ( state, siteId = getSelectedSiteId( state ) ) => {
	const form = getLabelSettingsForm( state, siteId );
	return form && form.data;
};

export const getLabelSettingsFormMeta = ( state, siteId = getSelectedSiteId( state ) ) => {
	const form = getLabelSettingsForm( state, siteId );
	return form && form.meta;
};

export const getLabelSettingsStoreOptions = ( state, siteId = getSelectedSiteId( state ) ) => {
	const form = getLabelSettingsForm( state, siteId );
	return form && form.storeOptions;
};

export const areSettingsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	const meta = getLabelSettingsFormMeta( state, siteId );
	return meta && meta.isLoaded;
};

export const areSettingsFetching = ( state, siteId = getSelectedSiteId( state ) ) => {
	const meta = getLabelSettingsFormMeta( state, siteId );
	return meta && meta.isFetching;
};

export const areSettingsErrored = ( state, siteId = getSelectedSiteId( state ) ) => {
	const meta = getLabelSettingsFormMeta( state, siteId );
	return meta && meta.isFetchError;
};

export const areLabelsEnabled = ( state, siteId = getSelectedSiteId( state ) ) => {
	const data = getLabelSettingsFormData( state, siteId );
	return data && data.enabled;
};

export const getSelectedPaymentMethodId = ( state, siteId = getSelectedSiteId( state ) ) => {
	const data = getLabelSettingsFormData( state, siteId );
	return data && data.selected_payment_method_id;
};

export const isPristine = ( state, siteId = getSelectedSiteId( state ) ) => {
	const meta = getLabelSettingsFormMeta( state, siteId );
	return meta && meta.pristine;
};
