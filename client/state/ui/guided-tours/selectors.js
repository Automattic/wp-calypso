/** @ssr-ready **/

/**
 * External dependencies
 */
import { get, difference, find, map, noop, startsWith, uniq } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { ROUTE_SET } from 'state/action-types';
import { getInitialQueryArguments } from 'state/ui/selectors';
import { getActionLog } from 'state/ui/action-log/selectors';
import { getPreference } from 'state/preferences/selectors';
import GuidedToursConfig from 'layout/guided-tours/config';
import createSelector from 'lib/create-selector';

const getToursHistory = state => getPreference( state, 'guided-tours-history' );
const debug = debugFactory( 'calypso:guided-tours' );

const relevantFeatures = map( GuidedToursConfig.meta, ( tourMeta, key ) => ( {
	tour: key,
	path: tourMeta.path,
	when: tourMeta.when,
} ) );

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
	state => uniq( map( getToursHistory( state ), 'tourName' ) ),
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
 * tour hasn't been ruled out (e.g. if it has already been seen, or if the
 * "when" isn't right).
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
		const { when = noop } = find( relevantFeatures, { tour } );
		return when( state );
	} );
};

export const findEligibleTour = createSelector(
	state => findRequestedTour( state ) || findTriggeredTour( state ),
	[ getActionLog, getToursHistory ]
);

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
		const tour = findEligibleTour( state );
		const shouldShow = !! tour;

		debug(
			'tours: reached', getToursFromFeaturesReached( state ),
			'seen', getToursSeen( state ),
			'found', tour );

		if ( ! tour ) {
			return {
				...tourState,
				shouldShow: false,
			};
		}

		return {
			...tourState,
			tour,
			shouldShow,
		};
	},
	[ getRawGuidedTourState, getActionLog ]
);
