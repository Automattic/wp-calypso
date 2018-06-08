/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';
/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getStoredCards, hasLoadedStoredCardsFromServer } from 'state/stored-cards/selectors';

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

export const getEmailReceipts = ( state, siteId = getSelectedSiteId( state ) ) => {
	const data = getLabelSettingsFormData( state, siteId );
	return data && data.email_receipts;
};

export const userCanManagePayments = ( state, siteId = getSelectedSiteId( state ) ) => {
	const meta = getLabelSettingsFormMeta( state, siteId );
	return meta && meta.can_manage_payments;
};

export const userCanEditSettings = ( state, siteId = getSelectedSiteId( state ) ) => {
	const meta = getLabelSettingsFormMeta( state, siteId );
	return meta && meta.can_edit_settings;
};

export const getPaperSize = ( state, siteId = getSelectedSiteId( state ) ) => {
	const data = getLabelSettingsFormData( state, siteId );
	return data && data.paper_size;
};

export const getPaymentMethods = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! hasLoadedStoredCardsFromServer( state ) ) {
		const meta = getLabelSettingsFormMeta( state, siteId );
		return meta && meta.payment_methods;
	}

	return getStoredCards( state )
		.map( card => ( {
			payment_method_id: Number( card.stored_details_id ),
			card_type: card.card_type,
			name: card.name,
			card_digits: card.card,
			expiry: card.expiry,
		} ) )
		.sort( ( a, b ) => b.payment_method_id - a.payment_method_id );
};

export const getPaymentMethodsWarning = ( state, siteId = getSelectedSiteId( state ) ) => {
	const meta = getLabelSettingsFormMeta( state, siteId );
	return meta && meta.warnings && meta.warnings.payment_methods;
};

export const getMasterUserInfo = ( state, siteId = getSelectedSiteId( state ) ) => {
	const meta = getLabelSettingsFormMeta( state, siteId );
	return {
		masterUserName: meta && meta.master_user_name,
		masterUserLogin: meta && meta.master_user_login,
		masterUserEmail: meta && meta.master_user_email,
	};
};

export const getMarkOrdersComplete = ( state, siteId = getSelectedSiteId( state ) ) => {
	const data = getLabelSettingsFormData( state, siteId );
	return data && data.mark_orders_complete;
};

export const getEmailTrackingInfo = ( state, siteId = getSelectedSiteId( state ) ) => {
	const data = getLabelSettingsFormData( state, siteId );
	return data && data.email_tracking_info;
};
