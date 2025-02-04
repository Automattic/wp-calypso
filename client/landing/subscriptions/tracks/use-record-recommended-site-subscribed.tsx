import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordRecommendedSiteSubscribed = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordRecommendedSiteSubscribed = ( tracksProps: {
		blog_id: string | null;
		url: string;
		source?: string;
	} ) => {
		recordSubscriptionsTracksEvent(
			'calypso_subscriptions_recommended_site_subscribed',
			tracksProps
		);

		// Also record the calypso_subscriptions_site_subscribed event.
		// reader: calypso_reader_site_followed (ui_algo: following_manage)
		// subscriptions: calypso_subscriptions_site_subscribed (ui_algo: (not included))
		recordSubscriptionsTracksEvent( 'calypso_subscriptions_site_subscribed', tracksProps );
	};

	return recordRecommendedSiteSubscribed;
};

export default useRecordRecommendedSiteSubscribed;
