import { isSiteOnECommerceTrial, isSiteOnWooExpress } from 'calypso/state/sites/plans/selectors';

/**
 * Returns theme filters that are not shown in the UI nor navigation URL.
 * @param  {Object}  state   Global state tree
 * @param  {?number} siteId  Site ID to optionally use as context
 * @param  {?string} tabFilter Tab filter to optionally use as context
 * @returns {Array}          Array of filter slugs
 */
export function getThemeHiddenFilters( state, siteId, tabFilter ) {
	const filters = [];
	const isECommerceTrialOrWooExpress =
		isSiteOnECommerceTrial( state, siteId ) || isSiteOnWooExpress( state, siteId );

	if ( isECommerceTrialOrWooExpress && tabFilter === 'recommended' ) {
		filters.push( 'store' );
	}

	return filters;
}
