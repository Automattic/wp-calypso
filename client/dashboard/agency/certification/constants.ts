import type { AgencyTierId } from '@automattic/api-core';

/** The exam's page on Automattic's certification site, which links through to scheduling. */
export const CERTIFICATION_EXAM_URL =
	'https://wordpresscertifications.com/advanced-professional-wordpress-developer/';

/** The agency coupon's standard discount on the exam fee, per tier. */
export const BASE_DISCOUNT: Record< AgencyTierId, number > = {
	'emerging-partner': 5,
	'agency-partner': 10,
	'pro-agency-partner': 15,
	'vip-pro-agency-partner': 20,
	'premier-partner': 25,
};

/**
 * Every tier's discount is doubled through the end of Q1 2027; the same codes
 * go back to the standard discount on April 1, 2027.
 */
export const PROMO_MULTIPLIER = 2;
export const PROMO_LAST_DAY = '2027-03-31';
