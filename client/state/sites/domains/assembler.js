/** @format */

/**
 * Internal dependencies
 */
import { getDomainType, getGdprConsentStatus, getTransferStatus } from 'lib/domains/utils';
import { camelCase, mapKeys } from 'lodash';

function assembleGoogleAppsSubscription( googleAppsSubscription ) {
	if ( ! googleAppsSubscription ) {
		return;
	}

	return mapKeys( googleAppsSubscription, ( value, key ) => camelCase( key ) );
}

export const createSiteDomainObject = domain => {
	return {
		autoRenewalDate: String( domain.auto_renewal_date ),
		adminEmail: domain.admin_email,
		autoRenewing: Boolean( domain.auto_renewing ),
		blogId: Number( domain.blog_id ),
		canSetAsPrimary: Boolean( domain.can_set_as_primary ),
		currentUserCanManage: Boolean( domain.current_user_can_manage ),
		domain: String( domain.domain ),
		domainLockingAvailable: Boolean( domain.domain_locking_available ),
		expired: Boolean( domain.expired ),
		expiry: ! domain.expiry ? null : String( domain.expiry ),
		expirySoon: Boolean( domain.expiry_soon ),
		gdprConsentStatus: getGdprConsentStatus( domain ),
		googleAppsSubscription: assembleGoogleAppsSubscription( domain.google_apps_subscription ),
		hasPrivacyProtection: Boolean( domain.has_private_registration ),
		hasRegistration: Boolean( domain.has_registration ),
		hasWpcomNameservers: domain.has_wpcom_nameservers,
		hasZone: Boolean( domain.has_zone ),
		isAutoRenewing: Boolean( domain.auto_renewing ),
		isPendingIcannVerification: Boolean( domain.is_pending_icann_verification ),
		isPrimary: Boolean( domain.primary_domain ),
		isPendingWhoisUpdate: Boolean( domain.pending_whois_update ),
		isPrivate: Boolean( domain.private_domain ),
		isWPCOMDomain: Boolean( domain.wpcom_domain ),
		manualTransferRequired: Boolean( domain.manual_transfer_required ),
		newRegistration: Boolean( domain.new_registration ),
		name: String( domain.domain ),
		owner: String( domain.owner ),
		partnerDomain: Boolean( domain.partner_domain ),
		pendingRegistration: Boolean( domain.pending_registration ),
		pendingRegistrationTime: String( domain.pending_registration_time ),
		pendingTransfer: domain.pending_transfer,
		pointsToWpcom: Boolean( domain.points_to_wpcom ),
		privateDomain: domain.private_domain,
		privacyAvailable: Boolean( domain.privacy_available ),
		registrar: String( domain.registrar ),
		registrationDate: String( domain.registration_date ),
		subscriptionId: domain.subscription_id,
		supportsDomainConnect: Boolean( domain.supports_domain_connect ),
		tldMaintenanceEndTime: domain.tld_maintenance_end_time,
		transferLockOnWhoisUpdateOptional: Boolean( domain.transfer_lock_on_whois_update_optional ),
		type: getDomainType( domain ),
		transferStatus: getTransferStatus( domain ),
		whoisUpdateUnmodifiableFields: domain.whois_update_unmodifiable_fields,
	};
};
