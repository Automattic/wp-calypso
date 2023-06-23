import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordSiteUnsubscribed = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordSiteUnsubscribed = ( tracksProps: {
		blog_id: string;
		url: string;
		ui_algo?: string;
	} ) => {
		return recordSubscriptionsTracksEvent( 'calypso_subscriptions_site_unsubscribed', tracksProps );
	};

	return recordSiteUnsubscribed;
};

export default useRecordSiteUnsubscribed;
