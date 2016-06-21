/**
 * External dependencies
 */
import mapValues from 'lodash/mapValues';

/**
 * Internal dependencies
 */
import { GUIDED_TOUR_TRIGGER, SET_ROUTE } from 'state/action-types';
import { getAll } from 'layout/guided-tours/config';
import { showGuidedTour, nextGuidedTourStep } from 'state/ui/guided-tours/actions';
import { getGuidedTourState } from 'state/ui/guided-tours/selectors';

export const contextMiddleware = store => next => action => {
	next( action );
	const tourState = getGuidedTourState( store.getState() );
	const allTours = getAll();

	if ( ! tourState.shouldReallyShow ) {
		// find eligible tours and activate them
		const toursWithContexts = mapValues( allTours, 'showInContext' );
		Object.keys( toursWithContexts )
			.filter( tour => toursWithContexts[ tour ] )
			.forEach( tour => toursWithContexts[ tour ]( store.getState() ) && store.dispatch( showGuidedTour( { shouldShow: true, tour } ) ) );
	} else if ( tourState.tour ) {
		// ???
		const stepConfig = allTours[ tourState.tour ][ tourState.stepName ];
		if ( ( stepConfig.showInContext && ! stepConfig.showInContext( store.getState() ) ) ||
				( stepConfig.continueIf && stepConfig.continueIf( store.getState() ) ) ) {
			console.log( 'skipping step', stepConfig );
			store.dispatch( nextGuidedTourStep( { tour: tourState.tour, stepName: allTours[ tourState.tour ][ tourState.stepName ].next } ) );
		}
	}
};

export const triggerLogger = store => next => action => {
	if ( action.type === SET_ROUTE ) {
		store.dispatch( {
			type: GUIDED_TOUR_TRIGGER,
			trigger: action,
			timestamp: Date.now(),
		} );
	}

	next( action );
};

export default triggerLogger;
