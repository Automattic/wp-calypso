import mapValues from 'lodash/mapValues';

import { getAll } from 'layout/guided-tours/config';
import { showGuidedTour } from 'state/ui/guided-tours/actions';
import { getGuidedTourState } from 'state/ui/guided-tours/selectors';

export const contextMiddleware = store => next => action => {
	next( action );
	if ( ! getGuidedTourState( store.getState() ).shouldShow ) {
		const toursWithContexts = mapValues( getAll(), 'showInContext' );
		Object.keys( toursWithContexts )
			.filter( tour => toursWithContexts[ tour ] )
			.forEach( tour => toursWithContexts[ tour ]( store.getState() ) && store.dispatch( showGuidedTour( { shouldShow: true, tour } ) ) );
	}
};

export default contextMiddleware;
