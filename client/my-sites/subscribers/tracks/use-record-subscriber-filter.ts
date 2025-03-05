import { SubscribersFilterBy } from '../constants';
import useRecordSubscriberTrackEvent from './use-record-subscriber-tracks-event';

const useRecordSubscriberFilter = () => {
	const recordSubscribersTracksEvent = useRecordSubscriberTrackEvent();

	return ( tracksProps: {
		site_id?: number | null;
		filter: SubscribersFilterBy;
		filter_field: string;
		filter_label: string;
	} ) => {
		recordSubscribersTracksEvent( 'calypso_subscribers_filter_applied', tracksProps );
	};
};

export default useRecordSubscriberFilter;
