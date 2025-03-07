import useRecordSubscriberTrackEvent from './use-record-subscriber-tracks-event';

const useRecordSubscriberSearch = () => {
	const recordSubscribersTracksEvent = useRecordSubscriberTrackEvent();

	return ( tracksProps: { site_id?: number | null; query: string } ) => {
		recordSubscribersTracksEvent( 'calypso_subscribers_search_performed', tracksProps );
	};
};

export default useRecordSubscriberSearch;
