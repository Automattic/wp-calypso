/**
 * Internal dependencies
 */
import {
	getDomainRegistrationAgreementUrl,
	getDomainType,
	getGdprConsentStatus,
	getTransferStatus,
} from 'lib/domains/utils';
import { camelCase, mapKeys } from 'lodash';

function assembleGoogleAppsSubscription( googleAppsSubscription ) {
	if ( ! googleAppsSubscription ) {
		return;
	}

	return mapKeys( googleAppsSubscription, ( value, key ) => camelCase( key ) );
}

export const createSiteDomainObject = domain => {
	let transferEndDate = null;
	if ( domain.transfer_start_date ) {
		transferEndDate = new Date( domain.transfer_start_date );
		transferEndDate.setDate( transferEndDate.getDate() + 7 ); // Add 7 days.
		transferEndDate = transferEndDate.toIsoString();
	}

	return {
		autoRenewalDate: String( domain.auto_renewal_date ),
		adminEmail: domain.admin_email,
		autoRenewing: Boolean( domain.auto_renewing ),
		blogId: Number( domain.blog_id ),
		bundledPlanSubscriptionId: domain.bundled_plan_subscription_id,
		canSetAsPrimary: Boolean( domain.can_set_as_primary ),
		contactInfoDisclosureAvailable: Boolean( domain.contact_info_disclosure_available ),
		contactInfoDisclosed: Boolean( domain.contact_info_disclosed ),
		currentUserCanManage: Boolean( domain.current_user_can_manage ),
		domain: String( domain.domain ),
		domainLockingAvailable: Boolean( domain.domain_locking_available ),
		domainRegistrationAgreementUrl: getDomainRegistrationAgreementUrl( domain ),
		emailForwardsCount: Number( domain.email_forwards_count ),
		expired: Boolean( domain.expired ),
		expiry: ! domain.expiry ? null : String( domain.expiry ),
		expirySoon: Boolean( domain.expiry_soon ),
		gdprConsentStatus: getGdprConsentStatus( domain ),
		googleAppsSubscription: assembleGoogleAppsSubscription( domain.google_apps_subscription ),
		hasRegistration: Boolean( domain.has_registration ),
		hasWpcomNameservers: domain.has_wpcom_nameservers,
		hasZone: Boolean( domain.has_zone ),
		isLocked: Boolean( domain.is_locked ),
		isRenewable: Boolean( domain.is_renewable ),
		isRedeemable: Boolean( domain.is_redeemable ),
		isEligibleForInboundTransfer: Boolean( domain.is_eligible_for_inbound_transfer ),
		isAutoRenewing: Boolean( domain.auto_renewing ),
		isPendingIcannVerification: Boolean( domain.is_pending_icann_verification ),
		isPrimary: Boolean( domain.primary_domain ),
		isPendingWhoisUpdate: Boolean( domain.pending_whois_update ),
		isSubdomain: Boolean( domain.is_subdomain ),
		isWPCOMDomain: Boolean( domain.wpcom_domain ),
		isWpcomStagingDomain: Boolean( domain.is_wpcom_staging_domain ),
		manualTransferRequired: Boolean( domain.manual_transfer_required ),
		mustRemovePrivacyBeforeContactUpdate: Boolean(
			domain.must_remove_privacy_before_contact_update
		),
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
		renewableUntil: String( domain.renewable_until ),
		redeemableUntil: String( domain.redeemable_until ),
		subscriptionId: domain.subscription_id,
		supportsDomainConnect: Boolean( domain.supports_domain_connect ),
		supportsGdprConsentManagement: Boolean( domain.supports_gdpr_consent_management ),
		supportsTransferApproval: Boolean( domain.supports_transfer_approval ),
		tldMaintenanceEndTime: domain.tld_maintenance_end_time,
		transferAwayEligibleAt: ! domain.transfer_away_eligible_at
			? null
			: String( domain.transfer_away_eligible_at ),
		transferLockOnWhoisUpdateOptional: Boolean( domain.transfer_lock_on_whois_update_optional ),
		type: getDomainType( domain ),
		transferStatus: getTransferStatus( domain ),
		transferStartDate: ! domain.transfer_start_date ? null : String( domain.transfer_start_date ),
		transferEndDate,
		whoisUpdateUnmodifiableFields: domain.whois_update_unmodifiable_fields,
	};
};
