import useRecordSubscriberTrackEvent from './use-record-subscriber-tracks-event';

const useRecordExport = () => {
	const recordSubscribersTracksEvent = useRecordSubscriberTrackEvent();

	return () => {
		recordSubscribersTracksEvent( 'calypso_subscribers_export_downloaded' );
	};
};

export default useRecordExport;
