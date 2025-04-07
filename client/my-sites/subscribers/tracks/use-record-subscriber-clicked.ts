import useRecordSubscriberTrackEvent from './use-record-subscriber-tracks-event';

const useRecordSubscriberClicked = () => {
	const recordSubscribersTracksEvent = useRecordSubscriberTrackEvent();

	return (
		where: 'title' | 'icon' | 'row' | 'list',
		tracksProps: { site_id?: number | null; subscription_id?: number; user_id?: number }
	) => {
		recordSubscribersTracksEvent(
			`calypso_subscribers_subscriber_${ where }_clicked`,
			tracksProps
		);
	};
};

export default useRecordSubscriberClicked;
