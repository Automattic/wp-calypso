import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordPostEmailsToggle = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();
	const recordPostEmailsToggle = (
		enabled: boolean,
		tracksProps: {
			blog_id: string;
		}
	) => {
		if ( enabled ) {
			return recordSubscriptionsTracksEvent(
				'calypso_subscriptions_post_emails_toggle_on',
				tracksProps
			);
		}
		return recordSubscriptionsTracksEvent(
			'calypso_subscriptions_post_emails_toggle_off',
			tracksProps
		);
	};
	return recordPostEmailsToggle;
};

export default useRecordPostEmailsToggle;
