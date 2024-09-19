import { useEffect, useContext } from 'react';
import { GuidedTourContext } from 'calypso/a8c-for-agencies/data/guided-tours/guided-tour-context';

const GuidedTour = ( { defaultTourId }: { defaultTourId: string } ) => {
	const { currentTourId, currentStep, startTour } = useContext( GuidedTourContext );

	useEffect( () => {
		if ( ! currentTourId && defaultTourId ) {
			startTour( defaultTourId );
		}
	}, [ currentTourId, defaultTourId, startTour ] );

	if ( ! currentTourId || ! currentStep ) {
		return null;
	}

	return null;
};

export default GuidedTour;
