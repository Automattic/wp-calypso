import { fetchActiveSubscriptionsForUser } from '../../data/me-active-subscriptions';

export const activeSubscriptionsQuery = () => ( {
	queryKey: [ 'me', 'activesubscriptions' ],
	queryFn: fetchActiveSubscriptionsForUser,
} );
