import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordSiteIconClicked = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordSiteIconClicked = ( tracksProps: { blog_id: string } ) => {
		return recordSubscriptionsTracksEvent( 'calypso_subscriptions_site_icon_clicked', tracksProps );
	};

	return recordSiteIconClicked;
};

export default useRecordSiteIconClicked;
