import { useEffect, useContext } from 'react';
import { GuidedTourContext } from 'calypso/components/guided-tour/data/guided-tour-context';

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
