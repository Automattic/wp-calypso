import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordCommentNotificationsToggle = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordCommentNotificationsToggle = (
		enabled: boolean,
		tracksProps: {
			blog_id: string | null;
			post_id: number | null;
		}
	) => {
		if ( enabled ) {
			recordSubscriptionsTracksEvent(
				'calypso_subscriptions_comment_notifications_toggle_on',
				tracksProps
			);
		} else {
			recordSubscriptionsTracksEvent(
				'calypso_subscriptions_comment_notifications_toggle_off',
				tracksProps
			);
		}
	};

	return recordCommentNotificationsToggle;
};

export default useRecordCommentNotificationsToggle;
