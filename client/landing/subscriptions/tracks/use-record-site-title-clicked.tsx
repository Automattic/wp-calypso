import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordSiteTitleClicked = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordSiteTitleClicked = ( tracksProps: {
		blog_id: string;
		feed_id: string;
		source?: string;
	} ) => {
		recordSubscriptionsTracksEvent( 'calypso_subscriptions_site_title_click', tracksProps );
	};

	return recordSiteTitleClicked;
};

export default useRecordSiteTitleClicked;
