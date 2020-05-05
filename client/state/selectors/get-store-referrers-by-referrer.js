/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';

import 'state/stats/init';

export default function ( state, { siteId, statType, query, selectedReferrer } ) {
	const rawData = getSiteStatsNormalizedData( state, siteId, statType, query );
	return rawData.map( ( d ) => {
		const { data, ...props } = d;
		let referrerData;
		if ( selectedReferrer ) {
			referrerData = find( data, ( r ) => r.referrer === selectedReferrer ) || {};
		} else {
			referrerData = data.reduce(
				( all, r ) => {
					return Object.assign( all, {
						add_to_carts: all.add_to_carts + r.add_to_carts,
						product_purchases: all.product_purchases + r.product_purchases,
						product_views: all.product_views + r.product_views,
						sales: all.sales + r.sales,
						currency: r.currency,
					} );
				},
				{
					referrer: 'All',
					add_to_carts: 0,
					product_purchases: 0,
					product_views: 0,
					sales: 0,
				}
			);
		}
		return {
			...props,
			...referrerData,
			period: props.date,
		};
	} );
}
