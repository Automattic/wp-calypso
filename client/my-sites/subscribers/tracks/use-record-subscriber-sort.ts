import { SubscribersSortBy } from '../constants';
import useRecordSubscriberTrackEvent from './use-record-subscriber-tracks-event';

const useRecordSubscriberSort = () => {
	const recordSubscribersTracksEvent = useRecordSubscriberTrackEvent();

	return ( tracksProps: {
		site_id?: number | null;
		sort_field: SubscribersSortBy;
		sort_direction: 'asc' | 'desc';
	} ) => {
		recordSubscribersTracksEvent( 'calypso_subscribers_sort_changed', tracksProps );
	};
};

export default useRecordSubscriberSort;
