/**
 * External dependencies
 */

import { get, omit, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSerializedReviewsQuery } from './utils';

/**
 * @param {object} state Whole Redux state tree
 * @param {object} [query] Query used to fetch reviews. Can contain page, status, etc. If not provided, defaults to first page, all reviews.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether reviews have been successfully loaded from the server
 */
export const areReviewsLoaded = ( state, query, siteId = getSelectedSiteId( state ) ) => {
	const serializedQuery = getSerializedReviewsQuery( query );
	const reviews = get(
		state,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'reviews', 'queries', serializedQuery ],
		false
	);
	return isArray( reviews );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {object} [query] Query used to fetch reviews. Can contain page, status, etc. If not provided, defaults to first page, all reviews.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether reviews are currently being retrieved from the server
 */
export const areReviewsLoading = ( state, query = {}, siteId = getSelectedSiteId( state ) ) => {
	const serializedQuery = getSerializedReviewsQuery( query );
	const isLoading = get( state, [
		'extensions',
		'woocommerce',
		'sites',
		siteId,
		'reviews',
		'isQueryLoading',
		serializedQuery,
	] );
	// Strict check because it could also be undefined.
	return true === isLoading;
};

/**
 * @param {object} state Whole Redux state tree
 * @param {object} [query] Query used to fetch reviews. Can contain page, status, etc. If not provided, defaults to first page, all reviews.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array|false} Array of reviews, or false if there was an error
 */
export const getReviews = ( state, query = {}, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areReviewsLoaded( state, query, siteId ) ) {
		return [];
	}
	const serializedQuery = getSerializedReviewsQuery( query );
	const reviews = get(
		state,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'reviews', 'items' ],
		{}
	);
	const reviewIdsOnPage = get(
		state,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'reviews', 'queries', serializedQuery ],
		[]
	);
	if ( reviewIdsOnPage.length ) {
		return reviewIdsOnPage.map( ( id ) => reviews[ id ] );
	}
	return false;
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} reviewId ID number of a review
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object|null} The requested review object, or null if not available
 */
export const getReview = ( state, reviewId, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'reviews', 'items', reviewId ],
		null
	);
};

/**
 * @param {object} state Whole Redux state tree
 * @param {object} [query] Query used to fetch reviews. Can contain page, status, etc. If not provided, defaults to first page, all reviews.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number} Total number of reviews available on a site, or 0 if not loaded yet.
 */
export const getTotalReviews = ( state, query = {}, siteId = getSelectedSiteId( state ) ) => {
	const serializedQuery = getSerializedReviewsQuery( omit( query, 'page' ) );
	return get(
		state,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'reviews', 'total', serializedQuery ],
		0
	);
};
