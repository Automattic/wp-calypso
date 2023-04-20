import { SubscriptionManager } from '@automattic/data-stores';
import { PendingSiteList } from 'calypso/landing/subscriptions/components/pending-site-list';
import TabView from '../tab-view';

const Pending = () => {
	const {
		data: pendingSites,
		isLoading,
		error,
	} = SubscriptionManager.usePendingSiteSubscriptionsQuery();

	// todo: translate when we have agreed on the error message
	const errorMessage = error ? 'An error occurred while fetching your subscriptions.' : '';

	return (
		<TabView errorMessage={ errorMessage } isLoading={ isLoading }>
			<PendingSiteList pendingSites={ pendingSites } />
		</TabView>
	);
};

export default Pending;
