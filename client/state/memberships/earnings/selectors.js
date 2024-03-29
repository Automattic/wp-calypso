import { get } from 'lodash';

import 'calypso/state/memberships/init';

export function getEarningsForSiteId( state, siteId ) {
	return get( state, [ 'memberships', 'earnings', 'summary', siteId ] );
}

export function getEarningsWithDefaultsForSiteId( state, siteId ) {
	const earnings = getEarningsForSiteId( state, siteId ) ?? {};
	return {
		...earnings,
		total: earnings.total ?? 0,
		last_month: earnings.last_month ?? 0,
		forecast: earnings.forecast ?? 0,
		currency: earnings.currency ?? 'USD', // For the record, this is never sent by the backend
		commission: earnings.commission ?? null,
	};
}
