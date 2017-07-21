/**
 * External dependencies
 */
import { get } from 'lodash';
/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

export const getLabelSettingsForm = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'woocommerceServices', siteId, 'labelSettings' ] );
};

export const getLabelSettingsFormData = ( state, siteId = getSelectedSiteId( state ) ) => {
	const form = getLabelSettingsForm( state, siteId );
	if ( ! form ) {
		return null;
	}

	return form.data;
};

export const getLabelSettingsFormMeta = ( state, siteId = getSelectedSiteId( state ) ) => {
	const form = getLabelSettingsForm( state, siteId );
	if ( ! form ) {
		return null;
	}

	return form.meta;
};

export const getLabelSettingsStoreOptions = ( state, siteId = getSelectedSiteId( state ) ) => {
	const form = getLabelSettingsForm( state, siteId );
	if ( ! form ) {
		return null;
	}

	return form.storeOptions;
};
