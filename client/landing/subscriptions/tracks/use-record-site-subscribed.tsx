import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordSiteSubscribed = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordSiteSubscribed = ( tracksProps: {
		blog_id: string;
		url: string;
		ui_algo?: string;
	} ) => {
		return recordSubscriptionsTracksEvent( 'calypso_subscriptions_site_subscribed', tracksProps );
	};

	return recordSiteSubscribed;
};

export default useRecordSiteSubscribed;
