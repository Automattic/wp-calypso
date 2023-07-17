import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordSiteIconClicked = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordSiteIconClicked = ( tracksProps: {
		blog_id: string | null;
		feed_id?: string;
		source?: string;
	} ) => {
		recordSubscriptionsTracksEvent( 'calypso_subscriptions_site_icon_clicked', tracksProps );
	};

	return recordSiteIconClicked;
};

export default useRecordSiteIconClicked;
