import { SubscriptionManager } from '@automattic/data-stores';
import { PendingPostList, PendingSiteList } from '../../pending-list';
import TabView from '../tab-view';

const Pending = () => {
	const {
		data: pendingSites,
		isLoading: isLoadingPendingSites,
		error: errorPendingSites,
	} = SubscriptionManager.usePendingSiteSubscriptionsQuery();

	const {
		data: pendingPosts,
		isLoading: isLoadingPendingPosts,
		error: errorPendingPosts,
	} = SubscriptionManager.usePendingPostSubscriptionsQuery();

	// todo: translate when we have agreed on the error message
	let errorMessage;
	if ( errorPendingSites ) {
		errorMessage = 'An error occurred while fetching your site subscriptions.';
	} else if ( errorPendingPosts ) {
		errorMessage = 'An error occurred while fetching your post subscriptions.';
	}

	return (
		<TabView
			errorMessage={ errorMessage }
			isLoading={ isLoadingPendingSites || isLoadingPendingPosts }
		>
			<PendingSiteList pendingSites={ pendingSites } />
			<PendingPostList pendingPosts={ pendingPosts } />
		</TabView>
	);
};

export default Pending;
