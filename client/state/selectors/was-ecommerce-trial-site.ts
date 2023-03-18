import getRawSite from 'calypso/state/selectors/get-raw-site';
import type { AppState } from 'calypso/types';

export default function wasEcommerceTrialSite( state: AppState, siteId: number ) {
	const site = getRawSite( state, siteId );

	return site?.was_ecommerce_trial === true;
}
