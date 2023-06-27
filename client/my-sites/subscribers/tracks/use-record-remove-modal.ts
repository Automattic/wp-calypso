import useRecordSubscriberTrackEvent from './use-record-subscriber-tracks-event';

const useRecordRemoveModal = () => {
	const recordSubscribersTracksEvent = useRecordSubscriberTrackEvent();

	return ( paid: boolean, action: string ) => {
		const eventName = `calypso_subscribers_remove_${
			paid ? 'paid' : 'free'
		}_subscriber_${ action }`;
		recordSubscribersTracksEvent( eventName );
	};
};

export default useRecordRemoveModal;
