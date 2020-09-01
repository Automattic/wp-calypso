/**
 * External dependencies
 */
import { isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_SEARCH_TIER_UP_TO_100_RECORDS,
	JETPACK_SEARCH_TIER_UP_TO_1K_RECORDS,
	JETPACK_SEARCH_TIER_UP_TO_10K_RECORDS,
	JETPACK_SEARCH_TIER_UP_TO_100K_RECORDS,
	JETPACK_SEARCH_TIER_UP_TO_1M_RECORDS,
	JETPACK_SEARCH_TIER_MORE_THAN_1M_RECORDS,
} from 'lib/products-values/constants';

const TIERS = [
	JETPACK_SEARCH_TIER_UP_TO_100_RECORDS,
	JETPACK_SEARCH_TIER_UP_TO_1K_RECORDS,
	JETPACK_SEARCH_TIER_UP_TO_10K_RECORDS,
	JETPACK_SEARCH_TIER_UP_TO_100K_RECORDS,
	JETPACK_SEARCH_TIER_UP_TO_1M_RECORDS,
	JETPACK_SEARCH_TIER_MORE_THAN_1M_RECORDS,
];

/**
 * Get Jetpack Search tier by number of search records
 *
 * @param {number} recordCount Number of search records
 * @returns {string} Tier
 */
export function getJetpackSearchTierByRecords(
	recordCount: number
): typeof TIERS[ number ] | undefined {
	if ( ! isNumber( recordCount ) || recordCount < 0 ) {
		return;
	}
	if ( recordCount <= 100 ) {
		return JETPACK_SEARCH_TIER_UP_TO_100_RECORDS;
	}
	if ( recordCount <= 1000 ) {
		return JETPACK_SEARCH_TIER_UP_TO_1K_RECORDS;
	}
	if ( recordCount <= 10000 ) {
		return JETPACK_SEARCH_TIER_UP_TO_10K_RECORDS;
	}
	if ( recordCount <= 100000 ) {
		return JETPACK_SEARCH_TIER_UP_TO_100K_RECORDS;
	}
	if ( recordCount <= 1000000 ) {
		return JETPACK_SEARCH_TIER_UP_TO_1M_RECORDS;
	}
	return JETPACK_SEARCH_TIER_MORE_THAN_1M_RECORDS;
}
