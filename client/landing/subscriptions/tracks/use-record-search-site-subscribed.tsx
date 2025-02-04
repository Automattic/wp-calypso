import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { useSubscriptionManagerContext } from '../components/subscription-manager-context';
import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordSearchSiteSubscribed = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const { isReaderPortal } = useSubscriptionManagerContext();

	const recordSearchSiteSubscribed = ( tracksProps: {
		blog_id: string | null;
		url: string;
		source?: string;
	} ) => {
		recordSubscriptionsTracksEvent( 'calypso_subscriptions_search_site_subscribed', tracksProps );

		if ( isReaderPortal ) {
			// reader: reader-following-manage-search-result
			// subscriptions: reader-subscriptions-search-recommendation
			bumpStat( 'reader_follows', 'reader-subscriptions-search-recommendation' );

			// reader: followed_blog
			// subscriptions: subscribed_blog
			bumpStat( 'reader_actions', 'subscribed_blog' );

			// reader: 'Reader', 'Clicked Follow Blog', 'reader-following-manage-search-result'
			// subscriptions: 'Reader', 'Clicked Subscribed Blog', 'reader-subscriptions-sites-recommendation'
			gaRecordEvent(
				'Reader',
				'Clicked Subscribed Blog',
				'reader-subscriptions-search-recommendation'
			);
		}

		// Also record the calypso_subscriptions_site_subscribed event.
		// reader: calypso_reader_site_followed (ui_algo: following_manage)
		// subscriptions: calypso_subscriptions_site_subscribed (ui_algo: (not included))
		recordSubscriptionsTracksEvent( 'calypso_subscriptions_site_subscribed', tracksProps );
	};

	return recordSearchSiteSubscribed;
};

export default useRecordSearchSiteSubscribed;
