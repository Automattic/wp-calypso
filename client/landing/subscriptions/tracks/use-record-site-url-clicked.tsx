import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordSiteUrlClicked = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordSiteUrlClicked = ( tracksProps: {
		blog_id: string | null;
		feed_id?: string;
		source?: string;
	} ) => {
		recordSubscriptionsTracksEvent( 'calypso_subscriptions_site_url_clicked', tracksProps );
	};

	return recordSiteUrlClicked;
};

export default useRecordSiteUrlClicked;
