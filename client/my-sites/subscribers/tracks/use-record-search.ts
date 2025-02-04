import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useSubscribersPage } from '../components/subscribers-page/subscribers-page-context';
import useRecordSubscriberTrackEvent from './use-record-subscriber-tracks-event';

const useRecordSearch = () => {
	const recordSubscribersTracksEvent = useRecordSubscriberTrackEvent();
	const { searchTerm } = useSubscribersPage();

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
