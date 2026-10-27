import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordViewFeedButtonClicked = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordViewFeedButtonClicked = ( {
		blogId,
		feedId,
		source,
	}: {
		blogId: string | null;
		feedId: string;
		source?: string;
	} ) => {
		recordSubscriptionsTracksEvent( 'calypso_subscriptions_view_feed_button_clicked', {
			blog_id: blogId,
			feed_id: feedId,
			source,
		} );
	};

	return recordViewFeedButtonClicked;
};

export default useRecordViewFeedButtonClicked;
