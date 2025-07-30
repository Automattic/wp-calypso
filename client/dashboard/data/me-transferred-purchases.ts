import wpcom from 'calypso/lib/wp';
import type { ActiveSubscription } from './me-active-subscriptions';

export function fetchTransferredPurchases(): ActiveSubscription[] {
	return wpcom.req.get( {
		path: '/me/purchases/transferred',
		apiVersion: '1.1',
	} );
}
