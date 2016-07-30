/** @ssr-ready **/

/**
 * External dependencies
 */
import { get, difference, find, map, memoize, noop, startsWith, uniq } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { ROUTE_SET } from 'state/action-types';
import { isSectionLoading, getInitialQueryArguments } from 'state/ui/selectors';
import { getActionLog } from 'state/ui/action-log/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { getPreference } from 'state/preferences/selectors';
import createSelector from 'lib/create-selector';
import guidedToursConfig from 'layout/guided-tours/config';

const getToursConfig = memoize( ( tour ) => guidedToursConfig.get( tour ) );
const getToursHistory = state => getPreference( state, 'guided-tours-history' );
const debug = debugFactory( 'calypso:guided-tours' );
const relevantFeatures = map( guidedToursConfig.getAll(), ( tour, key ) => {
	return {
		tour: key,
		path: tour.meta.path,
		context: tour.meta.context,
	};
} );

const DAY_IN_MILLISECONDS = 1000 * 3600 * 24;

/*
 * Returns a collection of tour names. These tours are selected if the user has
 * recently navigated to a section of Calypso that comes with a corresponding
 * tour.
 */
const getToursFromFeaturesReached = createSelector(
	state => (
		uniq( getActionLog( state )
			.filter( ( { type } ) => type === ROUTE_SET )
			.reduceRight( ( allTours, { path: triggerPath } ) => {
				const newTours = relevantFeatures
					.filter( ( { path: featurePath } ) =>
						startsWith( triggerPath, featurePath ) )
					.map( feature => feature.tour );

				return newTours
					? [ ...allTours, ...newTours ]
					: allTours;
			}, [] ) )
	),
	getActionLog
);

/*
 * Returns the names of the tours that the user has previously seen, both
 * recently and in the past.
 */
const getToursSeen = createSelector(
	state => uniq(
		getToursHistory( state )
			.map( ( { tourName } ) => tourName )
	),
	getToursHistory
);

/*
 * Returns the name of the tour requested via the URL's query arguments, if the
 * tour exists. Returns `undefined` otherwise.
 */
const getTourFromQuery = createSelector(
	state => {
		const { tour } = getInitialQueryArguments( state );
		if ( tour && find( relevantFeatures, { tour } ) ) {
			return tour;
		}
	},
	getInitialQueryArguments
);

export const isNewUser = state => {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return false;
	}

	const creation = Date.parse( user.date );
	return ( Date.now() - creation ) <= DAY_IN_MILLISECONDS;
};

/*
 * Returns true if `tour` has been seen in the current Calypso session, false
 * otherwise.
 */
const hasJustSeenTour = createSelector(
	( state, tourName ) => {
		const { _timestamp } = getInitialQueryArguments( state );
		return getToursHistory( state ).some( entry =>
			entry.tourName === tourName &&
			entry.timestamp > _timestamp
		);
	},
	[ getInitialQueryArguments, getToursHistory ]
);

/*
 * Returns the name of the tour requested via URL query arguments if it hasn't
 * "just" been seen (i.e., in the current Calypso session).
 */
const findRequestedTour = state => {
	const requestedTour = getTourFromQuery( state );
	if ( requestedTour && ! hasJustSeenTour( state, requestedTour ) ) {
		return requestedTour;
	}
};

/*
 * Returns the name of the first tour available from triggers, assuming the
 * tour hasn't been ruled out (e.g. if it has already been seen or if the
 * "context" isn't right.
 */
const findTriggeredTour = state => {
	const toursFromTriggers = uniq( [
		...getToursFromFeaturesReached( state ),
		// Right now, only one source from which to derive tours, but we may
		// have more later. Examples:
		// ...getToursFromPurchases( state ),
		// ...getToursFromFirstActions( state ),
	] );

	const toursToDismiss = uniq( [
		// Same idea here.
		...getToursSeen( state ),
	] );

	const newTours = difference( toursFromTriggers, toursToDismiss );
	return find( newTours, tour => {
		const { context = noop } = find( relevantFeatures, { tour } );
		return context( state );
	} );
};

export const findEligibleTour = createSelector(
	state => findRequestedTour( state ) || findTriggeredTour( state ),
	[ getActionLog, getToursHistory ]
);

const getStepConfig = ( state, tourConfig, stepName ) => {
	const step = tourConfig[ stepName ] || false;
	const shouldSkip = !! (
		step &&
		( step.showInContext && ! step.showInContext( state ) ) ||
		( step.continueIf && step.continueIf( state ) )
	);
	return shouldSkip
		? getStepConfig( state, tourConfig, step.next )
		: step;
};

/**
 * Returns the current state for Guided Tours.
 *
 * This includes the raw state from state/ui/guidedTour, but also the available
 * configuration (`stepConfig`) for the currently active tour step, if one is
 * active.
 *
 * @param  {Object}  state Global state tree
 * @return {Object}        Current Guided Tours state
 */
const getRawGuidedTourState = state => get( state, 'ui.guidedTour', false );

export const getGuidedTourState = createSelector(
	state => {
		const tourState = getRawGuidedTourState( state );
		const { stepName = 'init' } = tourState;

		const tour = findEligibleTour( state );
		const shouldReallyShow = !! tour;

		debug(
			'tours: reached', getToursFromFeaturesReached( state ),
			'seen', getToursSeen( state ),
			'found', tour );

		if ( ! tour ) {
			return {
				...tourState,
				shouldShow: false,
				stepConfig: false,
				nextStepConfig: false,
			};
		}

		const tourConfig = getToursConfig( tour );

		if ( ! tourConfig ) {
			debug( 'found no tour configuration for tour "' + tour + '", bailing out' );
			return {
				...tourState,
				shouldShow: false,
				stepConfig: false,
				nextStepConfig: false,
			};
		}

		const stepConfig = getStepConfig( state, tourConfig, stepName ) || false;
		const nextStepConfig = getStepConfig( state, tourConfig, stepConfig.next ) || false;

		const shouldShow = !! (
			! isSectionLoading( state ) &&
			shouldReallyShow
		);

		return {
			...tourState,
			tour,
			stepConfig,
			nextStepConfig,
			shouldShow,
		};
	},
	[ getRawGuidedTourState, isSectionLoading, getActionLog ]
);
