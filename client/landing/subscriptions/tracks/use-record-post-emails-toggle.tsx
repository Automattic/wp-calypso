import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordPostEmailsToggle = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();
	const recordPostEmailsToggle = (
		enabled: boolean,
		tracksProps: {
			blog_id: string | null;
		}
	) => {
		if ( enabled ) {
			recordSubscriptionsTracksEvent( 'calypso_subscriptions_post_emails_toggle_on', tracksProps );
		} else {
			recordSubscriptionsTracksEvent( 'calypso_subscriptions_post_emails_toggle_off', tracksProps );
		}
	};
	return recordPostEmailsToggle;
};

export default useRecordPostEmailsToggle;
