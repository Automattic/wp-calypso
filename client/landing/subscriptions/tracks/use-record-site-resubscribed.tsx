import useRecordSiteSubscribed from './use-record-site-subscribed';
import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordSiteResubscribed = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordSiteSubscribed = useRecordSiteSubscribed();

	const recordSiteResubscribed = ( tracksProps: {
		blog_id: string | null;
		url: string;
		source?: string;
	} ) => {
		recordSubscriptionsTracksEvent( 'calypso_subscriptions_site_resubscribed', tracksProps );

		// Also record the calypso_subscriptions_site_subscribed event.
		recordSiteSubscribed( tracksProps );
	};

	return recordSiteResubscribed;
};

export default useRecordSiteResubscribed;
