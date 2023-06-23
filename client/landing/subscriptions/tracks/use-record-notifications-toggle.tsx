import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordNotificationsToggle = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordNotificationsToggle = (
		enabled: boolean,
		tracksProps: {
			blog_id: string;
		}
	) => {
		if ( enabled ) {
			return recordSubscriptionsTracksEvent(
				'calypso_subscriptions_notifications_toggle_on',
				tracksProps
			);
		}
		return recordSubscriptionsTracksEvent(
			'calypso_subscriptions_notifications_toggle_off',
			tracksProps
		);
	};

	return recordNotificationsToggle;
};

export default useRecordNotificationsToggle;
