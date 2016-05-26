export const SITE_ID_0 = 2916284;
export const SITE_ID_1 = 77203074;
export const USER_ID = 73705554;

export const SERVICE_TYPE = 'one-of-our-service-types';

export const VOUCHER_0 = {
	assigned: new Date().toISOString(),
	assigned_by: USER_ID,
	code: 'A73T-8JS7-GS5Y',
	status: 'assigned'
};

export const VOUCHER_1 = {
	assigned: new Date().toISOString(),
	assigned_by: USER_ID,
	code: 'OT6D-LO7A-I7XG',
	status: 'assigned'
};

export const AD_CREDITS_0 = {
	[ SERVICE_TYPE ]: [ VOUCHER_0 ]
};

export const AD_CREDITS_1 = {
	[ SERVICE_TYPE ]: [ VOUCHER_1 ]
};

export const AD_CREDITS = {
	[ SERVICE_TYPE ]: [
		VOUCHER_0,
		VOUCHER_1
	]
};

// WP REST-API error response
export const ERROR_OBJECT = new Error( 'There was a problem fetching site vouchers.' );

// WP RESP-API response
export const REST_API_RESPONSE = {
	headers: {
		'Content-Type': 'application/json',
		Date: new Date().toGMTString()
	},
	vouchers: AD_CREDITS
};

// WP RESP-API POST response - assign a SERVICE_TYPE voucher
export const REST_API_ASSIGN_VOUCHER_RESPONSE = {
	headers: {
		'Content-Type': 'application/json',
		Date: new Date().toGMTString()
	},
	service_type: SERVICE_TYPE,
	voucher: VOUCHER_0
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
					[ SITE_ID_0 ]: {
						[ SERVICE_TYPE ]: [ VOUCHER_0 ]
					},
					[ SITE_ID_1 ]: {
						[ SERVICE_TYPE ]: [ VOUCHER_1 ]
					}
				},

				requesting: {
					[ SITE_ID_0 ]: false,
					[ SITE_ID_1 ]: true
				}
			}
		}
	};
};
