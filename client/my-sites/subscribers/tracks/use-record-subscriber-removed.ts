import useRecordSubscriberTrackEvent from './use-record-subscriber-tracks-event';

const useRecordSubscriberRemoved = () => {
	const recordSubscribersTracksEvent = useRecordSubscriberTrackEvent();

	return ( tracksProps: {
		site_id?: number | null;
		subscription_id?: number;
		user_id?: number;
	} ) => {
		recordSubscribersTracksEvent( 'calypso_subscribers_subscriber_removed', tracksProps );
	};
};

export default useRecordSubscriberRemoved;
