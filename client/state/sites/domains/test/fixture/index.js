/**
 * Internal dependencies
 */
import {
	SITE_DOMAINS_RECEIVE,
	SITE_DOMAINS_REQUEST,
	SITE_DOMAINS_REQUEST_SUCCESS,
	SITE_DOMAINS_REQUEST_FAILURE,
} from 'state/action-types';
import { createSiteDomainObject } from 'state/sites/domains/assembler';

// first testing-site ID
export const SITE_ID_FIRST = 2916284;
export const SUBSCRIPTION_ID_FIRST = '1111';

// second testing-site ID
export const SITE_ID_SECOND = 77203074;
export const SUBSCRIPTION_ID_SECOND = null;

// testing primary-domain
export const DOMAIN_PRIMARY = {
	autoRenewalDate: '2017-02-07T00:00:00+00:00',
	autoRenewing: true,
	adminEmail: null,
	blogId: SITE_ID_FIRST,
	bundledPlanSubscriptionId: null,
	canSetAsPrimary: true,
	contactInfoDisclosed: false,
	contactInfoDisclosureAvailable: false,
	currentUserCanManage: true,
	domain: 'retronevergiveup.me',
	domainLockingAvailable: true,
	domainRegistrationAgreementUrl: null,
	pointsToWpcom: true,
	emailForwardsCount: 0,
	expired: false,
	expiry: '2017-03-09T00:00:00+00:00',
	expirySoon: false,
	gdprConsentStatus: null,
	googleAppsSubscription: {
		status: 'no_subscription',
	},
	privacyAvailable: false,
	hasRegistration: false,
	hasWpcomNameservers: true,
	hasZone: true,
	isEligibleForInboundTransfer: true,
	isAutoRenewing: true,
	isPendingIcannVerification: false,
	isPendingWhoisUpdate: false,
	isSubdomain: false,
	isWpcomStagingDomain: false,
	isLocked: false,
	manualTransferRequired: false,
	mustRemovePrivacyBeforeContactUpdate: false,
	newRegistration: false,
	name: 'retronevergiveup.me',
	owner: 'John Doe',
	partnerDomain: false,
	pendingRegistration: false,
	pendingRegistrationTime: '',
	pendingTransfer: false,
	privateDomain: false,
	redeemableUntil: '',
	isPrimary: true,
	isRedeemable: false,
	isRenewable: false,
	registrar: '',
	registrationDate: '2016-03-09T00:00:00+00:00',
	renewableUntil: '',
	subscriptionId: SUBSCRIPTION_ID_FIRST,
	supportsDomainConnect: false,
	supportsGdprConsentManagement: true,
	supportsTransferApproval: true,
	tldMaintenanceEndTime: 0,
	type: 'MAPPED',
	transferAwayEligibleAt: null,
	transferStatus: null,
	transferStartDate: null,
	transferEndDate: null,
	transferLockOnWhoisUpdateOptional: true,
	whoisUpdateUnmodifiableFields: [],
	isWPCOMDomain: false,
};

// testing not-primary-domain
export const DOMAIN_NOT_PRIMARY = {
	autoRenewalDate: '',
	autoRenewing: false,
	adminEmail: null,
	blogId: SITE_ID_SECOND,
	bundledPlanSubscriptionId: null,
	canSetAsPrimary: true,
	contactInfoDisclosed: false,
	contactInfoDisclosureAvailable: false,
	currentUserCanManage: true,
	domain: 'retronevergiveup.wordpress.me',
	domainLockingAvailable: true,
	domainRegistrationAgreementUrl: null,
	pointsToWpcom: true,
	emailForwardsCount: 0,
	expired: false,
	expiry: null,
	expirySoon: false,
	gdprConsentStatus: null,
	googleAppsSubscription: {
		status: 'no_subscription',
	},
	privacyAvailable: false,
	hasRegistration: false,
	hasWpcomNameservers: true,
	hasZone: false,
	isEligibleForInboundTransfer: false,
	isAutoRenewing: false,
	isPendingIcannVerification: false,
	isPendingWhoisUpdate: false,
	isSubdomain: true,
	isWpcomStagingDomain: false,
	isLocked: false,
	manualTransferRequired: false,
	mustRemovePrivacyBeforeContactUpdate: false,
	newRegistration: false,
	name: 'retronevergiveup.wordpress.me',
	owner: typeof undefined,
	partnerDomain: false,
	pendingRegistration: false,
	pendingRegistrationTime: '',
	pendingTransfer: false,
	privateDomain: false,
	isPrimary: false,
	isRedeemable: false,
	isRenewable: false,
	redeemableUntil: '',
	renewableUntil: '',
	registrar: '',
	registrationDate: '',
	subscriptionId: SUBSCRIPTION_ID_SECOND,
	supportsDomainConnect: false,
	supportsGdprConsentManagement: true,
	supportsTransferApproval: true,
	tldMaintenanceEndTime: 0,
	type: 'WPCOM',
	transferAwayEligibleAt: null,
	transferStatus: null,
	transferStartDate: null,
	transferEndDate: null,
	transferLockOnWhoisUpdateOptional: false,
	whoisUpdateUnmodifiableFields: [ 'first_name', 'last_name' ],
	isWPCOMDomain: true,
};

// WP REST-API error response
export const ERROR_MESSAGE_RESPONSE =
	'There was a problem fetching site domains. Please try again later or contact support.';

export const REST_API_SITE_DOMAIN_FIRST = {
	auto_renewal_date: '2017-02-07T00:00:00+00:00',
	auto_renewing: 1,
	admin_email: null,
	blog_id: SITE_ID_FIRST,
	bundled_plan_subscription_id: null,
	can_set_as_primary: true,
	domain: 'retronevergiveup.me',
	domain_locking_available: true,
	domainRegistrationAgreementUrl: null,
	points_to_wpcom: true,
	email_forwards_count: 0,
	expired: false,
	expiry: '2017-03-09T00:00:00+00:00',
	expiry_soon: false,
	gdprConsentStatus: null,
	google_apps_subscription: {
		status: 'no_subscription',
	},
	has_private_registration: false,
	privacyAvailable: false,
	has_registration: false,
	has_wpcom_nameservers: true,
	has_zone: true,
	current_user_can_manage: true,
	is_redeemable: false,
	is_renewable: false,
	is_locked: false,
	redeemable_until: '',
	renewable_until: '',
	is_eligible_for_inbound_transfer: true,
	is_pending_icann_verification: false,
	is_subdomain: false,
	is_wpcom_staging_domain: false,
	manual_transfer_required: false,
	manual_whois: false,
	new_registration: false,
	owner: 'John Doe',
	partner_domain: false,
	pending_registration: false,
	pending_registration_time: '',
	pending_transfer: false,
	pending_whois_update: false,
	primary_domain: true,
	private_domain: false,
	registrar: '',
	registration_date: '2016-03-09T00:00:00+00:00',
	subscription_id: SUBSCRIPTION_ID_FIRST,
	supports_domain_connect: false,
	supports_gdpr_consent_management: true,
	supports_transfer_approval: true,
	tld_maintenance_end_time: 0,
	type: 'mapping',
	transfer_lock_on_whois_update_optional: true,
	whois_update_unmodifiable_fields: [],
	wpcom_domain: false,
};

export const REST_API_SITE_DOMAIN_SECOND = {
	auto_renewal_date: '',
	auto_renewing: false,
	admin_email: null,
	blog_id: SITE_ID_SECOND,
	bundled_plan_subscription_id: null,
	can_set_as_primary: true,
	domain: 'retronevergiveup.wordpress.me',
	domain_locking_available: true,
	domainRegistrationAgreementUrl: null,
	points_to_wpcom: true,
	email_forwards_count: 0,
	expired: false,
	expiry: false,
	expiry_soon: false,
	gdprConsentStatus: null,
	google_apps_subscription: {
		status: 'no_subscription',
	},
	has_private_registration: false,
	privacyAvailable: false,
	has_registration: false,
	has_wpcom_nameservers: true,
	has_zone: false,
	current_user_can_manage: true,
	is_locked: false,
	is_redeemable: false,
	is_renewable: false,
	redeemable_until: '',
	renewable_until: '',
	is_eligible_for_inbound_transfer: false,
	is_pending_icann_verification: false,
	is_subdomain: true,
	is_wpcom_staging_domain: false,
	manual_transfer_required: false,
	manual_whois: false,
	new_registration: false,
	partner_domain: false,
	pending_registration: false,
	pending_registration_time: '',
	pending_transfer: false,
	pending_whois_update: false,
	primary_domain: false,
	private_domain: false,
	registrar: '',
	registration_date: '',
	subscription_id: SUBSCRIPTION_ID_SECOND,
	supports_domain_connect: false,
	supports_gdpr_consent_management: true,
	supports_transfer_approval: true,
	tld_maintenance_end_time: 0,
	type: 'wpcom',
	whois_update_unmodifiable_fields: [ 'first_name', 'last_name' ],
	wpcom_domain: true,
};

// WP RESP-API response
export const REST_API_RESPONSE = {
	headers: {
		'Content-Type': 'application/json',
		Date: new Date().toGMTString(),
	},
	domains: [ REST_API_SITE_DOMAIN_FIRST ],
};

// WP RESP-API response
export const REST_API_ERROR_RESPONSE = {
	error: 'authorization_required',
	message: 'User or Token does not have access to specified site.',
};

// first testing-site domains
export const SITE_FIRST_DOMAINS = [ createSiteDomainObject( REST_API_SITE_DOMAIN_FIRST ) ];

// second testing-site domains
export const SITE_SECOND_DOMAINS = [ createSiteDomainObject( REST_API_SITE_DOMAIN_SECOND ) ];

// actions
export const ACTION_SITE_DOMAIN_RECEIVE = {
	type: SITE_DOMAINS_RECEIVE,
	siteId: SITE_ID_FIRST,
	domains: SITE_FIRST_DOMAINS,
};

export const ACTION_SITE_DOMAIN_REQUEST = {
	type: SITE_DOMAINS_REQUEST,
	siteId: SITE_ID_FIRST,
};

export const ACTION_SITE_DOMAIN_REQUEST_SUCCESS = {
	type: SITE_DOMAINS_REQUEST_SUCCESS,
	siteId: SITE_ID_FIRST,
};

export const ACTION_SITE_DOMAIN_REQUEST_FAILURE = {
	type: SITE_DOMAINS_REQUEST_FAILURE,
	siteId: SITE_ID_FIRST,
	error: ERROR_MESSAGE_RESPONSE,
};

/**
 * Return a whole state with domains data structure
 *
 * @returns {object} an state instance
 *
 * - first site-domians is not requesting
 * - second site-domians is requesting
 */
export const getStateInstance = () => {
	return {
		sites: {
			domains: {
				items: {
					[ SITE_ID_FIRST ]: SITE_FIRST_DOMAINS,
					[ SITE_ID_SECOND ]: SITE_SECOND_DOMAINS,
				},

				requesting: {
					[ SITE_ID_FIRST ]: false,
					[ SITE_ID_SECOND ]: true,
				},
			},
		},
	};
};
