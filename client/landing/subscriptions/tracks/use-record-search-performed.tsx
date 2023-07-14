import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordSearchPerformed = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordSearchPerformed = ( tracksProps: { query: string } ) => {
		// reader: calypso_reader_following_manage_search_performed
		// subman: calypso_subscriptions_search_performed
		recordSubscriptionsTracksEvent( 'calypso_subscriptions_search_performed', tracksProps );
	};

	return recordSearchPerformed;
};

export default useRecordSearchPerformed;
