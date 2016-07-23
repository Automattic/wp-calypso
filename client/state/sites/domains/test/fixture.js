/**
 * Action types constantes
 */
import {
	SITE_DOMAINS_RECEIVE,
	SITE_DOMAINS_REQUEST,
	SITE_DOMAINS_REQUEST_SUCCESS,
	SITE_DOMAINS_REQUEST_FAILURE
} from 'state/action-types';

// first testing-site ID
export const SITE_ID_FIRST = 2916284;

// second testing-site ID
export const SITE_ID_SECOND = 77203074;

// testing primary-domain
export const DOMAIN_PRIMARY = {
	autoRenewalDate: 'February 7, 2017',
	autoRenewing: true,
	blogId: SITE_ID_FIRST,
	canSetAsPrimary: true,
	domain: 'retronevergiveup.me',
	expired: false,
	expiry: '2017-03-09T00:00:00+00:00',
	expirySoon: false,
	googleAppsSubscription: {
		status: 'no_subscription'
	},
	hasPrivateRegistration: false,
	hasRegistration: false,
	hasZone: true,
	isPendingIcannVerification: false,
	manualTransferRequired: false,
	newRegistration: false,
	partnerDomain: false,
	pendingRegistration: false,
	pendingRegistrationTime: '',
	isPrimary: true,
	isPrivate: false,
	registrationDate: 'March 9, 2016',
	type: 'mapping',
	isWPCOMDomain: false
};

// testing not-primary-domain
export const DOMAIN_NOT_PRIMARY = {
	autoRenewalDate: '',
	autoRenewing: false,
	blogId: SITE_ID_SECOND,
	canSetAsPrimary: true,
	domain: 'retronevergiveup.wordpress.me',
	expired: false,
	expiry: false,
	expirySoon: false,
	googleAppsSubscription: {
		status: 'no_subscription'
	},
	hasPrivateRegistration: false,
	hasRegistration: false,
	hasZone: true,
	isPendingIcannVerification: false,
	manualTransferRequired: false,
	newRegistration: false,
	partnerDomain: false,
	pendingRegistration: false,
	pendingRegistrationTime: '',
	isPrimary: false,
	isPrivate: false,
	registrationDate: '',
	type: 'wpcom',
	isWPCOMDomain: true
};

// first testing-site domains
export const SITE_FIRST_DOMAINS = [
	DOMAIN_PRIMARY
];

// second testing-site domains
export const SITE_SECOND_DOMAINS = [
	DOMAIN_NOT_PRIMARY
];

// WP REST-API error response
export const ERROR_MESSAGE_RESPONSE = 'There was a problem fetching site domains. Please try again later or contact support.';

// actions
export const ACTION_SITE_DOMAIN_RECEIVE = {
	type: SITE_DOMAINS_RECEIVE,
	siteId: SITE_ID_FIRST,
	domains: SITE_FIRST_DOMAINS
};

export const ACTION_SITE_DOMAIN_REQUEST = {
	type: SITE_DOMAINS_REQUEST,
	siteId: SITE_ID_FIRST
};

export const ACTION_SITE_DOMAIN_REQUEST_SUCCESS = {
	type: SITE_DOMAINS_REQUEST_SUCCESS,
	siteId: SITE_ID_FIRST
};

export const ACTION_SITE_DOMAIN_REQUEST_FAILURE = {
	type: SITE_DOMAINS_REQUEST_FAILURE,
	siteId: SITE_ID_FIRST,
	error: ERROR_MESSAGE_RESPONSE
};

export const REST_API_SITE_DOMAIN_FIRST = {
	auto_renewal_date: 'February 7, 2017',
	auto_renewing: 1,
	blog_id: SITE_ID_FIRST,
	can_set_as_primary: true,
	domain: 'retronevergiveup.me',
	expired: false,
	expiry: '2017-03-09T00:00:00+00:00',
	expiry_soon: false,
	google_apps_subscription: {
		status: 'no_subscription'
	},
	has_private_registration: false,
	has_registration: false,
	has_zone: true,
	current_user_can_manage: false,
	is_pending_icann_verification: false,
	manual_transfer_required: false,
	new_registration: false,
	partner_domain: false,
	pending_registration: false,
	pending_registration_time: '',
	primary_domain: true,
	private_domain: false,
	registration_date: 'March 9, 2016',
	type: 'mapping',
	wpcom_domain: false
};

export const REST_API_SITE_DOMAIN_SECOND = {
	auto_renewal_date: '',
	auto_renewing: false,
	blog_id: SITE_ID_SECOND,
	can_set_as_primary: true,
	domain: 'retronevergiveup.wordpress.me',
	expired: false,
	expiry: false,
	expiry_soon: false,
	google_apps_subscription: {
		status: 'no_subscription'
	},
	has_private_registration: false,
	has_registration: false,
	has_zone: false,
	current_user_can_manage: false,
	is_pending_icann_verification: false,
	manual_transfer_required: false,
	new_registration: false,
	partner_domain: false,
	pending_registration: false,
	pending_registration_time: '',
	primary_domain: false,
	private_domain: false,
	registration_date: '',
	type: 'wpcom',
	wpcom_domain: true
};

// WP RESP-API response
export const REST_API_RESPONSE = {
	headers: {
		'Content-Type': 'application/json',
		Date: new Date().toGMTString()
	},
	domains: [ REST_API_SITE_DOMAIN_FIRST ]
};

// WP RESP-API response
export const REST_API_ERROR_RESPONSE = {
	error: 'authorization_required',
	message: 'User or Token does not have access to specified site.'
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
					[ SITE_ID_SECOND ]: SITE_SECOND_DOMAINS
				},

				requesting: {
					[ SITE_ID_FIRST ]: false,
					[ SITE_ID_SECOND ]: true
				}
			}
		}
	};
};
