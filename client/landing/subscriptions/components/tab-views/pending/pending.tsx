import { SubscriptionManager } from '@automattic/data-stores';
import { Notice } from 'calypso/landing/subscriptions/components/notice';
import { PendingPostList, PendingSiteList } from '../../pending-list';
import TabView from '../tab-view';

const Pending = () => {
	const {
		data: { pendingSites, totalCount: totalPendingSitesCount },
		isLoading: isLoadingPendingSites,
		error: errorPendingSites,
	} = SubscriptionManager.usePendingSiteSubscriptionsQuery();

	const {
		data: { pendingPosts, totalCount: totalPendingPostsCount },
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

	if (
		! isLoadingPendingSites &&
		! isLoadingPendingPosts &&
		! totalPendingSitesCount &&
		! totalPendingPostsCount
	) {
		// todo: translate when we have agreed on the empty view message
		return <Notice type="warning">No pending subscriptions were found.</Notice>;
	}

	return (
		<TabView
			errorMessage={ errorMessage }
			isLoading={ isLoadingPendingSites || isLoadingPendingPosts }
		>
			{ totalPendingSitesCount && <PendingSiteList pendingSites={ pendingSites } /> }
			{ totalPendingPostsCount && <PendingPostList pendingPosts={ pendingPosts } /> }
		</TabView>
	);
};

export default Pending;
