import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { useSubscriptionManagerContext } from '../components/subscription-manager-context';
import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordSiteSubscribed = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const { isReaderPortal } = useSubscriptionManagerContext();

	const recordSiteSubscribed = ( tracksProps: {
		blog_id: string | null;
		url: string;
		source?: string;
	} ) => {
		// reader: calypso_reader_site_followed, ui_algo: following_manage
		// subman: calypso_subscriptions_site_subscribed, ui_algo: (removed)
		recordSubscriptionsTracksEvent( 'calypso_subscriptions_site_subscribed', tracksProps );

		// For reader parity
		if ( isReaderPortal ) {
			// reader: following_manage
			// subman: reader-subscriptions-sites
			bumpStat( 'reader_follows', 'reader-subscriptions-sites' );

			// reader: followed_blog
			// subman: subscribed_blog
			bumpStat( 'reader_actions', 'subscribed_blog' );

			// reader: 'Reader', 'Clicked Follow Blog','reader-following-manage-recommendation'
			// subman: 'Reader', 'Clicked Subscribe Blog', 'reader-subscriptions-sites'
			gaRecordEvent( 'Reader', 'Clicked Subscribe Blog', 'reader-subscriptions-sites' );
		}
	};

	return recordSiteSubscribed;
};

export default useRecordSiteSubscribed;
