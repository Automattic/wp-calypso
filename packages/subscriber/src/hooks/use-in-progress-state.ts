import { useSelect } from '@wordpress/data';
import { useState, useEffect } from 'react';
import { IMPORT_PROGRESS_SIMULATION_DURATION } from '../config';
import { SUBSCRIBER_STORE } from '../store';

export function useInProgressState() {
	const addSelector = useSelect( ( s ) => s( SUBSCRIBER_STORE ).getAddSubscribersSelector() );
	const importSelector = useSelect( ( s ) => s( SUBSCRIBER_STORE ).getImportSubscribersSelector() );
	const IN_PROGRESS = addSelector?.inProgress || importSelector?.inProgress;
	const [ inProgress, setInProgress ] = useState( IN_PROGRESS );

	useEffect( () => {
		let timer: number | undefined;

		if ( inProgress ) {
			timer = setTimeout( () => {
				setInProgress( false );
			}, IMPORT_PROGRESS_SIMULATION_DURATION );
		}

		return () => clearTimeout( timer );
	}, [ IN_PROGRESS ] );

	if ( IN_PROGRESS ) {
		! inProgress && setInProgress( true );
	}

	return inProgress;
}
