import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from 'react';
import { SUBSCRIBER_STORE } from '../store';
import { useInProgressState } from './use-in-progress-state';

export type RecordTrackEvents = (
	eventName: string,
	eventProperties?: Record< string, unknown >
) => void;

export function useRecordAddFormEvents( recordTracksEvent?: RecordTrackEvents, flowName?: string ) {
	const trackEventPrefix = 'calypso_subscriber_add_form';
	const inProgress = useInProgressState();
	const prevInProgress = useRef( inProgress );
	const addSelector = useSelect( ( s ) => s( SUBSCRIBER_STORE ).getAddSubscribersSelector() );
	const importSelector = useSelect( ( s ) => s( SUBSCRIBER_STORE ).getImportSubscribersSelector() );

	useEffect( () => {
		recordTracksEvent?.( `${ trackEventPrefix }_display`, {
			flow_name: flowName,
		} );
	}, [] );

	useEffect( () => {
		addSelector?.inProgress &&
			recordTracksEvent?.( `${ trackEventPrefix }_individual_subscribers`, {
				flow_name: flowName,
			} );
	}, [ addSelector?.inProgress ] );

	useEffect( () => {
		importSelector?.inProgress &&
			recordTracksEvent?.( `${ trackEventPrefix }_csv_subscribers`, {
				flow_name: flowName,
			} );
	}, [ importSelector?.inProgress ] );

	useEffect( () => {
		importSelector?.error &&
			recordTracksEvent?.( `${ trackEventPrefix }_error`, {
				flow_name: flowName,
				error: importSelector.error.message,
			} );
	}, [ importSelector?.error ] );

	useEffect( () => {
		! inProgress &&
			prevInProgress.current &&
			! importSelector?.error &&
			recordTracksEvent?.( `${ trackEventPrefix }_success`, {
				flow_name: flowName,
			} );

		prevInProgress.current = inProgress;
	}, [ inProgress ] );
}
