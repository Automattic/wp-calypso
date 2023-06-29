import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useSubscriberListManager } from '../components/subscriber-list-manager/subscriber-list-manager-context';
import useRecordSubscriberTrackEvent from './use-record-subscriber-tracks-event';

const useRecordSearch = () => {
	const recordSubscribersTracksEvent = useRecordSubscriberTrackEvent();
	const { searchTerm } = useSubscriberListManager();

	const [ debouncedRecord ] = useDebouncedCallback( () => {
		recordSubscribersTracksEvent( 'calypso_subscribers_searched' );
	}, 1000 );

	useEffect( () => {
		if ( searchTerm ) {
			debouncedRecord();
		}
	}, [ debouncedRecord, searchTerm ] );
};

export default useRecordSearch;
