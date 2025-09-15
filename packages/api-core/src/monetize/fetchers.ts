import { wpcom } from '../wpcom-fetcher';
import { MembershipSubscription } from './types';

export async function fetchMonetizeSubscriptions(): Promise< MembershipSubscription[] > {
	const data = await wpcom.req.get( {
		path: '/me/memberships/subscriptions',
		apiVersion: '1.1',
	} );
	return data.subscriptions;
}
