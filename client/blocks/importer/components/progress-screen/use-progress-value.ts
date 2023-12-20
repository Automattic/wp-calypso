import { useEffect, useState } from 'react';
import { calculateProgress } from 'calypso/my-sites/importer/importing-pane';
import type { ImportJobProgress } from 'calypso/blocks/importer/types';

export default function useProgressValue( jobProgress: Partial< ImportJobProgress > = {} ): number {
	const isBackupImport = Object.keys( jobProgress ).length === 1 && !! jobProgress.steps;

	const [ realProgress, setRealProgress ] = useState( 0 );
	const [ movableProgress, setMovableProgress ] = useState( 0 );

	// set real progress
	useEffect( () => {
		const progress = jobProgress ? calculateProgress( jobProgress ) : NaN;
		setRealProgress( Number.isNaN( progress ) ? 0 : progress );
	}, [ jobProgress ] );

	// set movable progress
	useEffect( () => {
		if ( ! isBackupImport ) {
			return;
		}

		const nextMilestone = calculateProgress(
			jobProgress.steps
				? { steps: { completed: jobProgress.steps.completed + 1, total: jobProgress.steps.total } }
				: {}
		);

		// calculate movable progress
		const interval = setInterval( () => {
			if ( movableProgress >= nextMilestone ) {
				setMovableProgress( nextMilestone );
			} else {
				const progress = realProgress > movableProgress ? realProgress : movableProgress;
				setMovableProgress( progress + 1 );
			}
		}, 1000 );
		return () => clearInterval( interval );
	}, [ realProgress, movableProgress ] );

	return isBackupImport ? movableProgress : realProgress;
}
