import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordRecommendToggle = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordRecommendToggle = (
		enabled: boolean,
		tracksProps: {
			blog_id: string | null;
		}
	) => {
		recordSubscriptionsTracksEvent( 'calypso_subscriptions_recommend_toggle', {
			...tracksProps,
			enabled,
		} );
	};

	return recordRecommendToggle;
};

export default useRecordRecommendToggle;
