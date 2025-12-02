import { wpcom } from '../wpcom-fetcher';
import { MonetizeSubscription } from './types';

export async function fetchMonetizeSubscriptions(): Promise< MonetizeSubscription[] > {
	const data = await wpcom.req.get( {
		path: '/me/memberships/subscriptions',
		apiVersion: '1.1',
	} );
	return data.subscriptions;
}
