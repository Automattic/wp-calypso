import useRecordSubscriberTrackEvent from './use-record-subscriber-tracks-event';

const useRecordPaged = () => {
	const recordSubscribersTracksEvent = useRecordSubscriberTrackEvent();

	return ( tracksProps: { page: number } ) => {
		recordSubscribersTracksEvent( 'calypso_subscribers_list_paged', tracksProps );
	};
};

export default useRecordPaged;
