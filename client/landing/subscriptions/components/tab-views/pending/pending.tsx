import { SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { Notice, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import { PendingPostList, PendingSiteList } from '../../pending-list';
import TabView from '../tab-view';

const Pending = () => {
	const translate = useTranslate();

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

	let errorMessage;
	if ( errorPendingSites ) {
		errorMessage = translate( 'An error occurred while fetching your site subscriptions.' );
	} else if ( errorPendingPosts ) {
		errorMessage = translate( 'An error occurred while fetching your post subscriptions.' );
	}

	if (
		! isLoadingPendingSites &&
		! isLoadingPendingPosts &&
		! totalPendingSitesCount &&
		! totalPendingPostsCount
	) {
		return (
			<Notice type={ NoticeType.Success }>
				{ translate( 'All set! No pending subscriptions.' ) }
			</Notice>
		);
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
