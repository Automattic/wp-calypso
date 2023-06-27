import useRecordSubscriberTrackEvent from './use-record-subscriber-tracks-event';

const useRecordRemoveModal = () => {
	const recordSubscribersTracksEvent = useRecordSubscriberTrackEvent();

	return ( paid: boolean, action: string ) => {
		// Allows for:
		// - calypso_subscribers_remove_paid_subscriber_modal_showed
		// - calypso_subscribers_remove_paid_subscriber_modal_dismissed
		// - calypso_subscribers_remove_paid_subscriber_manage_button_clicked
		// - calypso_subscribers_remove_free_subscriber_modal_showed
		// - calypso_subscribers_remove_free_subscriber_modal_dismissed
		const eventName = `calypso_subscribers_remove_${
			paid ? 'paid' : 'free'
		}_subscriber_${ action }`;
		recordSubscribersTracksEvent( eventName );
	};
};

export default useRecordRemoveModal;
