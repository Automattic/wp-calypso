/**
 * Internal dependencies
 */

import {
	SECURE_YOUR_BRAND_REQUEST,
	SECURE_YOUR_BRAND_SUCCESS,
	SECURE_YOUR_BRAND_FAILURE,
} from 'calypso/state/action-types';

export const WPCOM_RESPONSE = {
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
};

export const SECURE_YOUR_BRAND = {
	items: WPCOM_RESPONSE,
	requesting: false,
	error: null,
};

export const ERROR_MESSAGE_RESPONSE = 'Failure';
export const SEARCH_DOMAIN = 'some-domain.id';

// actions
export const ACTION_SECURE_YOUR_BRAND_REQUEST = {
	type: SECURE_YOUR_BRAND_REQUEST,
	domain: SEARCH_DOMAIN,
};

export const ACTION_SECURE_YOUR_BRAND_SUCCESS = {
	type: SECURE_YOUR_BRAND_SUCCESS,
	secureYourBrand: WPCOM_RESPONSE,
};

export const ACTION_SECURE_YOUR_BRAND_FAILURE = {
	type: SECURE_YOUR_BRAND_FAILURE,
	error: ERROR_MESSAGE_RESPONSE,
};

/**
 * Return a whole state instance
 *
 * - requesting: false
 * - error: false
 *
 * @returns {object} an state instance
 */
export const getStateInstance = () => {
	return {
		secureYourBrand: {
			items: SECURE_YOUR_BRAND,
			requesting: false,
			error: null,
		},
	};
};
