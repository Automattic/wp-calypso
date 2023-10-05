import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordViewFeedButtonClicked = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordViewFeedButtonClicked = ( tracksProps: {
		blogId: string | null;
		feedId: string;
		source?: string;
	} ) => {
		recordSubscriptionsTracksEvent( 'calypso_subscriptions_view_feed_button_clicked', tracksProps );
	};

	return recordViewFeedButtonClicked;
};

export default useRecordViewFeedButtonClicked;
