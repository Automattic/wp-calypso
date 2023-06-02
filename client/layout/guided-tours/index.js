import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { resetGuidedToursHistory } from 'calypso/state/guided-tours/actions';
import { getGuidedTourState } from 'calypso/state/guided-tours/selectors';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';

function GuidedTours() {
	const dispatch = useDispatch();
	const tourState = useSelector( getGuidedTourState );
	const shouldShow = tourState && tourState.shouldShow;
	const requestedTour = useSelector( getInitialQueryArguments )?.tour;

	useEffect( () => {
		if ( requestedTour === 'reset' ) {
			dispatch( resetGuidedToursHistory() );
		}
	}, [ dispatch, requestedTour ] );

	if ( ! shouldShow ) {
		return null;
	}

	return <AsyncLoad require="calypso/layout/guided-tours/component" />;
}

export default GuidedTours;
