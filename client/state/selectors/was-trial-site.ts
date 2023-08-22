import { AppState } from 'calypso/types';
import wasBusinessTrialSite from './was-business-trial-site';
import wasEcommerceTrialSite from './was-ecommerce-trial-site';

export default function wasTrialSite( state: AppState, siteId: number ) {
	return wasEcommerceTrialSite( state, siteId ) || wasBusinessTrialSite( state, siteId );
}
