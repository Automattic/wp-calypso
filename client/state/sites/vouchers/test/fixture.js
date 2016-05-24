export const SITE_ID_0 = 2916284;
export const SITE_ID_1 = 77203074;
export const USER_ID = 73705554;

export const GOOGLE_VOUCHER_0 = {
	assigned: new Date().toISOString(),
	assigned_by: USER_ID,
	code: 'A73T-8JS7-GS5Y',
	status: 'assigned'
};

export const GOOGLE_VOUCHER_1 = {
	assigned: new Date().toISOString(),
	assigned_by: USER_ID,
	code: 'OT6D-LO7A-I7XG',
	status: 'assigned'
};

export const GOOGLE_AD_CREDITS_0 = {
	'google-ad-credits': [ GOOGLE_VOUCHER_0 ]
};

export const GOOGLE_AD_CREDITS_1 = {
	'google-ad-credits': [ GOOGLE_VOUCHER_1 ]
};

export const GOOGLE_AD_CREDITS = {
	'google-ad-credits': [
		GOOGLE_VOUCHER_0,
		GOOGLE_VOUCHER_1
	]
};

// WP REST-API error response
export const ERROR_MESSAGE_RESPONSE = 'There was a problem fetching site vouchers. Please try again later or contact support.';

// WP RESP-API response
export const REST_API_RESPONSE = {
	headers: {
		'Content-Type': 'application/json',
		Date: new Date().toGMTString()
	},
	vouchers: GOOGLE_AD_CREDITS
};

// WP RESP-API response
export const REST_API_ERROR_RESPONSE = {
	error: 'authorization_required',
	message: 'User or Token does not have access to specified site.'
};

/**
 * Return a whole state with vouchers data structure
 * @return {Object} an state instance
 *
 * - first site-domians is not requesting
 * - second site-domians is requesting
 */
export const getStateInstance = () => {
	return {
		sites: {
			vouchers: {
				items: {
					[ SITE_ID_0 ]: GOOGLE_AD_CREDITS_0,
					[ SITE_ID_1 ]: GOOGLE_AD_CREDITS_1
				},

				requesting: {
					[ SITE_ID_0 ]: false,
					[ SITE_ID_1 ]: true
				}
			}
		}
	};
};
