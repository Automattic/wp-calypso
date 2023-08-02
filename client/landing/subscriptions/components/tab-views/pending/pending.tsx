import { SubscriptionManager } from '@automattic/data-stores';
import { Notice, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import { PendingPostList, PendingSiteList } from '../../pending-list';
import TabView from '../tab-view';

const Pending = () => {
	const {
		data: { pendingSites, totalCount: totalPendingSitesCount = 0 },
		isLoading: isLoadingPendingSites,
		error: errorPendingSites,
	} = SubscriptionManager.usePendingSiteSubscriptionsQuery();

	const {
		data: { pendingPosts, totalCount: totalPendingPostsCount = 0 },
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
		return <Notice type={ NoticeType.Warning }>No pending subscriptions were found.</Notice>;
	}

	return (
		<TabView
			errorMessage={ errorMessage }
			isLoading={ isLoadingPendingSites || isLoadingPendingPosts }
		>
			{ totalPendingSitesCount > 0 && <PendingSiteList pendingSites={ pendingSites } /> }
			{ totalPendingPostsCount > 0 && <PendingPostList pendingPosts={ pendingPosts } /> }
		</TabView>
	);
};

export default Pending;
