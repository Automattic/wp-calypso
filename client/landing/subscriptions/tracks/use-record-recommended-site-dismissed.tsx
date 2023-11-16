import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordRecommendedSiteDismissed = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordRecommendedSiteDismissed = ( tracksProps: {
		blog_id: string | null;
		url: string;
		source?: string;
	} ) => {
		recordSubscriptionsTracksEvent(
			'calypso_subscriptions_recommended_site_dismissed',
			tracksProps
		);
	};

	return recordRecommendedSiteDismissed;
};

export default useRecordRecommendedSiteDismissed;
