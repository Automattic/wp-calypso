import useRecordSubscriberTrackEvent from './use-record-subscriber-tracks-event';

const useRecordSort = () => {
	const recordSubscribersTracksEvent = useRecordSubscriberTrackEvent();

	return ( tracksProps: { sort_field: string } ) => {
		recordSubscribersTracksEvent( 'calypso_subscribers_list_sorted', tracksProps );
	};
};

export default useRecordSort;
