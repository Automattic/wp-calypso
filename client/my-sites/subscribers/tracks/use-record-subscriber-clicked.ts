import useRecordSubscriberTrackEvent from './use-record-subscriber-tracks-event';

const useRecordSubscriberClicked = () => {
	const recordSubscribersTracksEvent = useRecordSubscriberTrackEvent();

	return (
		where: 'title' | 'icon' | 'row',
		tracksProps: { site_id?: number | null; subscription_id?: number; user_id?: number }
	) => {
		// Allows for calypso_subscribers_subscriber_title_clicked, calypso_subscribers_subscriber_icon_clicked & calypso_subscribers_subscriber_row_clicked
		recordSubscribersTracksEvent(
			`calypso_subscribers_subscriber_${ where }_clicked`,
			tracksProps
		);
	};
};

export default useRecordSubscriberClicked;
