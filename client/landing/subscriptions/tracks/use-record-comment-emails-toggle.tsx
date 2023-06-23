import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordCommentEmailsToggle = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordCommentEmailsToggle = (
		enabled: boolean,
		tracksProps: {
			blog_id: string;
		}
	) => {
		if ( enabled ) {
			return recordSubscriptionsTracksEvent(
				'calypso_subscriptions_comment_emails_toggle_on',
				tracksProps
			);
		}
		return recordSubscriptionsTracksEvent(
			'calypso_subscriptions_comment_emails_toggle_off',
			tracksProps
		);
	};

	return recordCommentEmailsToggle;
};

export default useRecordCommentEmailsToggle;
