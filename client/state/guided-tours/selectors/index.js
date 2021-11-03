import { createSelector } from '@automattic/state-utils';
import debugFactory from 'debug';
import GuidedToursConfig from 'calypso/layout/guided-tours/config';
import { GUIDED_TOUR_UPDATE, ROUTE_SET } from 'calypso/state/action-types';
import { preferencesLastFetchedTimestamp } from 'calypso/state/preferences/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRouteTimestamp from 'calypso/state/selectors/get-current-route-timestamp';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import { getActionLog } from 'calypso/state/ui/action-log/selectors';
import { getSectionName, getSectionGroup } from 'calypso/state/ui/selectors';
import findOngoingTour from './find-ongoing-tour';
import getToursHistory from './get-tours-history';

import 'calypso/state/guided-tours/init';

const SECTIONS_WITHOUT_TOURS = [
	'signup',
	'upgrades', // checkout
	'checkout-thank-you', // thank you page
];

const debug = debugFactory( 'calypso:guided-tours' );

function tourMatchesPath( tour, path ) {
	if ( ! tour.path ) {
		return false;
	}

	if ( Array.isArray( tour.path ) ) {
		return tour.path.some( ( p ) => path.startsWith( p ) );
	}

	return path.startsWith( tour.path );
}

/*
 * Returns a collection of tour names. These tours are selected if the user has
 * recently navigated to a section of Calypso that comes with a corresponding
 * tour.
 */
const getToursFromFeaturesReached = createSelector(
	( state ) => {
		// list of recent navigations in reverse order
		const navigationActions = getActionLog( state )
			.filter( ( { type } ) => type === ROUTE_SET )
			.reverse();
		// find tours that match by route path
		const tourEntries = Object.entries( GuidedToursConfig );
		const matchingTours = navigationActions.flatMap( ( action ) =>
			tourEntries.filter( ( [ , meta ] ) => tourMatchesPath( meta, action.path ) )
		);
		// return array of tour names
		return matchingTours.map( ( [ tour ] ) => tour );
	},
	[ getActionLog ]
);

/*
 * Returns the names of the tours that the user has previously seen, both
 * recently and in the past.
 */
const getToursSeen = createSelector(
	( state ) => [ ...new Set( getToursHistory( state ).map( ( tour ) => tour.tourName ) ) ],
	[ getToursHistory ]
);

/*
 * Returns the name and timestamp of the tour requested via the URL's query
 * arguments, if the tour exists. Returns `undefined` otherwise.
 */
const getTourFromQuery = createSelector(
	( state ) => {
		const initial = getInitialQueryArguments( state );
		const current = getCurrentQueryArguments( state );
		const timestamp = getCurrentRouteTimestamp( state );
		const tour = current.tour ?? initial.tour;

		if ( tour && GuidedToursConfig[ tour ] ) {
			return { tour, timestamp };
		}
	},
	[ getInitialQueryArguments, getCurrentQueryArguments ]
);

/*
 * Returns true if `tour` has been seen in the current Calypso session, false
 * otherwise.
 */
const hasJustSeenTour = ( state, { tour, timestamp } ) =>
	getToursHistory( state ).some(
		( entry ) => entry.tourName === tour && timestamp != null && entry.timestamp > timestamp
	);

/*
 * Returns the name of the tour requested via URL query arguments if it hasn't
 * "just" been seen (i.e., in the current Calypso session).
 */
const findRequestedTour = ( state ) => {
	const requestedTour = getTourFromQuery( state );
	if ( requestedTour && ! hasJustSeenTour( state, requestedTour ) ) {
		return requestedTour.tour;
	}
};

/*
 * Returns the name of the first tour available from triggers, assuming the
 * tour hasn't been ruled out (e.g. if it has already been seen, or if the
 * "when" isn't right).
 */
const findTriggeredTour = ( state ) => {
	if ( ! preferencesLastFetchedTimestamp( state ) ) {
		debug( 'No fresh user preferences, bailing.' );
		return;
	}

	const toursFromTriggers = getToursFromFeaturesReached( state );
	const toursToDismiss = getToursSeen( state );
	const newTours = toursFromTriggers.filter( ( tour ) => ! toursToDismiss.includes( tour ) );
	return newTours.find( ( tour ) => {
		const { when = () => true } = GuidedToursConfig[ tour ];
		return when( state );
	} );
};

const doesSectionAllowTours = ( state ) =>
	! SECTIONS_WITHOUT_TOURS.includes( getSectionName( state ) );

export const hasTourJustBeenVisible = createSelector(
	( state, now = Date.now() ) => {
		const last = getActionLog( state )
			.reverse()
			.find( ( action ) => action.type === GUIDED_TOUR_UPDATE && action.shouldShow === false );
		// threshold is one minute
		return last && now - last.timestamp < 60000;
	},
	[ getActionLog ]
);

const shouldBailAllTours = ( state ) => ! doesSectionAllowTours( state );

const shouldBailNewTours = ( state ) => hasTourJustBeenVisible( state );

export const findEligibleTour = createSelector(
	( state ) => {
		if ( shouldBailAllTours( state ) ) {
			return;
		}

		return (
			findOngoingTour( state ) ||
			( ! shouldBailNewTours( state ) &&
				( findRequestedTour( state ) || findTriggeredTour( state ) ) ) ||
			undefined
		);
	},
	// Though other state selectors are used in `findEligibleTour`'s body,
	// we're intentionally reducing the list of dependants to the following:
	[ getActionLog, getToursHistory ]
);

/**
 * Returns the current state for Guided Tours.
 *
 * This includes the raw state from state/guidedTours, but also the available
 * configuration (`stepConfig`) for the currently active tour step, if one is
 * active.
 *
 * @param  {object}  state Global state tree
 * @returns {object}        Current Guided Tours state
 */
const getRawGuidedTourState = ( state ) => state.guidedTours;

export const getGuidedTourState = createSelector(
	( state ) => {
		const emptyState = { shouldShow: false };
		const tourState = getRawGuidedTourState( state );
		const tour = findEligibleTour( state );
		const isGutenberg = getSectionGroup( state ) === 'gutenberg';
		const shouldShow = !! tour && ! isGutenberg;
		const isPaused = !! tourState.isPaused;

		debug(
			'tours: reached',
			getToursFromFeaturesReached( state ),
			'seen',
			getToursSeen( state ),
			'found',
			tour
		);

		if ( ! tour ) {
			return { ...tourState, ...emptyState };
		}

		return {
			...tourState,
			tour,
			shouldShow,
			isPaused,
		};
	},
	[ getRawGuidedTourState, getActionLog, preferencesLastFetchedTimestamp ]
);
