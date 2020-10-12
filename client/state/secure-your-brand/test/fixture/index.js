/**
 * Internal dependencies
 */

import {
	SECURE_YOUR_BRAND_REQUEST,
	SECURE_YOUR_BRAND_SUCCESS,
	SECURE_YOUR_BRAND_FAILURE,
} from 'calypso/state/action-types';

export const SECURE_YOUR_BRAND = {
	secureYourBrand: {
		product_data: [
			{
				product_id: 6,
				product_slug: 'domain_reg',
				domain: 'some-domain.com',
				cost: 20,
				currency: 'EUR',
			},
			{
				product_id: 6,
				product_slug: 'domain_reg',
				domain: 'some-domain.net',
				cost: 20,
				currency: 'EUR',
			},
			{
				product_id: 6,
				product_slug: 'domain_reg',
				domain: 'some-domain.org',
				cost: 20,
				currency: 'EUR',
			},
		],
		total_cost: 120,
		discounted_cost: 60,
		currency: 'EUR',
	},
};

// actions
export const ACTION_SECURE_YOUR_BRAND_REQUEST = {
	type: SECURE_YOUR_BRAND_REQUEST,
	secureYourBrand: SECURE_YOUR_BRAND,
};

export const ACTION_SECURE_YOUR_BRAND_SUCCESS = {
	type: SECURE_YOUR_BRAND_SUCCESS,
	secureYourBrand: SECURE_YOUR_BRAND,
};

export const ACTION_SECURE_YOUR_BRAND_FAILURE = {
	type: SECURE_YOUR_BRAND_FAILURE,
	error: 'Something',
};

/**
 * Return a whole state instance
 *
 * - requesting: false
 * - errors: false
 *
 * @returns {object} an state instance
 */
export const getStateInstance = () => {
	return {
		secureYourBrand: {
			secureYourBrand: SECURE_YOUR_BRAND,
			requesting: false,
			errors: null,
		},
	};
};
