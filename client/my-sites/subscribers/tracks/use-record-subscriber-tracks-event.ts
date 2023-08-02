import { recordTracksEvent } from '@automattic/calypso-analytics';

const useRecordSubscriberTracksEvent = () => {
	const recordSubscribersTracksEvent = ( tracksEventName: string, tracksEventProps?: object ) => {
		recordTracksEvent( tracksEventName, {
			...tracksEventProps,
		} );
	};

	return recordSubscribersTracksEvent;
};
export default useRecordSubscriberTracksEvent;
