import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { useSubscriptionManagerContext } from '../components/subscription-manager-context';
import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordSiteUnsubscribed = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const { isReaderPortal } = useSubscriptionManagerContext();

	const recordSiteUnsubscribed = ( tracksProps: {
		blog_id?: string | null;
		url: string;
		source?: string;
	} ) => {
		// reader: calypso_reader_site_unfollowed, ui_algo: following_manage
		// subman: calypso_subscriptions_site_subscribed, ui_algo: (removed)
		recordSubscriptionsTracksEvent( 'calypso_subscriptions_site_unsubscribed', tracksProps );

		// For reader parity
		if ( isReaderPortal ) {
			// reader: following_manage
			// subman: reader-subscriptions-sites
			bumpStat( 'reader_unfollows', 'reader-subscriptions-sites' );

			// reader: unfollowed_blog
			// subman: unsubscribed_blog
			bumpStat( 'reader_actions', 'unsubscribed_blog' );

			// reader: 'Reader', 'Clicked Unfollow Blog','reader-following-manage-recommendation'
			// subman: 'Reader', 'Clicked Unsubscribe Blog', 'reader-subscriptions-sites'
			gaRecordEvent( 'Reader', 'Clicked Unsubscribe Blog', 'reader-subscriptions-sites' );
		}
	};

	return recordSiteUnsubscribed;
};

export default useRecordSiteUnsubscribed;
