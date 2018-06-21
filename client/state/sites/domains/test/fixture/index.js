/** @format */

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
	canSetAsPrimary: true,
	currentUserCanManage: true,
	domain: 'retronevergiveup.me',
	domainLockingAvailable: true,
	pointsToWpcom: true,
	expired: false,
	expiry: '2017-03-09T00:00:00+00:00',
	expirySoon: false,
	gdprConsentStatus: null,
	googleAppsSubscription: {
		status: 'no_subscription',
	},
	hasPrivacyProtection: false,
	privacyAvailable: false,
	hasRegistration: false,
	hasWpcomNameservers: true,
	hasZone: true,
	isAutoRenewing: true,
	isPendingIcannVerification: false,
	isPendingWhoisUpdate: false,
	manualTransferRequired: false,
	newRegistration: false,
	name: 'retronevergiveup.me',
	owner: 'John Doe',
	partnerDomain: false,
	pendingRegistration: false,
	pendingRegistrationTime: '',
	pendingTransfer: false,
	privateDomain: false,
	isPrimary: true,
	isPrivate: false,
	registrar: '',
	registrationDate: '2016-03-09T00:00:00+00:00',
	subscriptionId: SUBSCRIPTION_ID_FIRST,
	supportsDomainConnect: false,
	tldMaintenanceEndTime: 0,
	type: 'MAPPED',
	transferStatus: null,
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
	canSetAsPrimary: true,
	currentUserCanManage: true,
	domain: 'retronevergiveup.wordpress.me',
	domainLockingAvailable: true,
	pointsToWpcom: true,
	expired: false,
	expiry: null,
	expirySoon: false,
	gdprConsentStatus: null,
	googleAppsSubscription: {
		status: 'no_subscription',
	},
	hasPrivacyProtection: false,
	privacyAvailable: false,
	hasRegistration: false,
	hasWpcomNameservers: true,
	hasZone: false,
	isAutoRenewing: false,
	isPendingIcannVerification: false,
	isPendingWhoisUpdate: false,
	manualTransferRequired: false,
	newRegistration: false,
	name: 'retronevergiveup.wordpress.me',
	owner: typeof undefined,
	partnerDomain: false,
	pendingRegistration: false,
	pendingRegistrationTime: '',
	pendingTransfer: false,
	privateDomain: false,
	isPrimary: false,
	isPrivate: false,
	registrar: '',
	registrationDate: '',
	subscriptionId: SUBSCRIPTION_ID_SECOND,
	supportsDomainConnect: false,
	tldMaintenanceEndTime: 0,
	type: 'WPCOM',
	transferStatus: null,
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
	can_set_as_primary: true,
	domain: 'retronevergiveup.me',
	domain_locking_available: true,
	points_to_wpcom: true,
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
	is_pending_icann_verification: false,
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
	can_set_as_primary: true,
	domain: 'retronevergiveup.wordpress.me',
	domain_locking_available: true,
	points_to_wpcom: true,
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
	is_pending_icann_verification: false,
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
 * @return {Object} an state instance
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
