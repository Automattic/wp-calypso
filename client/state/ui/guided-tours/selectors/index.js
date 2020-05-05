/**
 * External dependencies
 */

import {
	constant,
	difference,
	find,
	findLast,
	flatMap,
	get,
	includes,
	map,
	startsWith,
	uniq,
	pick,
} from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { GUIDED_TOUR_UPDATE, ROUTE_SET } from 'state/action-types';
import { getSectionName, getSectionGroup } from 'state/ui/selectors';
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'state/selectors/get-initial-query-arguments';
import { getActionLog } from 'state/ui/action-log/selectors';
import { preferencesLastFetchedTimestamp } from 'state/preferences/selectors';
import GuidedToursConfig from 'layout/guided-tours/config';
import createSelector from 'lib/create-selector';
import findOngoingTour from './find-ongoing-tour';
import getToursHistory from './get-tours-history';

const BLACKLISTED_SECTIONS = [
	'signup',
	'upgrades', // checkout
	'checkout-thank-you', // thank you page
];

const debug = debugFactory( 'calypso:guided-tours' );

const mappable = ( x ) => ( ! Array.isArray( x ) ? [ x ] : x) ;

const relevantFeatures = flatMap( GuidedToursConfig, ( tourMeta, key ) =>
	mappable( tourMeta.path ).map( ( path ) => ( {
		tour: key,
		when: tourMeta.when,
		path,
	} ) )
);

/*
 * Returns a collection of tour names. These tours are selected if the user has
 * recently navigated to a section of Calypso that comes with a corresponding
 * tour.
 */
const getToursFromFeaturesReached = createSelector(
	( state ) =>
		uniq(
			getActionLog( state )
				.filter( ( { type } ) => type === ROUTE_SET )
				.reduceRight( ( allTours, { path: triggerPath } ) => {
					const newTours = relevantFeatures
						.filter( ( { path: featurePath } ) => startsWith( triggerPath, featurePath ) )
						.map( ( feature ) => feature.tour );

					return newTours ? [ ...allTours, ...newTours ] : allTours;
				}, [] )
		),
	[ getActionLog ]
);

/*
 * Returns the names of the tours that the user has previously seen, both
 * recently and in the past.
 */
const getToursSeen = createSelector(
	( state ) => uniq( map( getToursHistory( state ), 'tourName' ) ),
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
		const tourProps = [ 'tour', '_timestamp' ];
		const { tour, _timestamp } =
			current && current.tour ? pick( current, tourProps ) : pick( initial, tourProps );

		if ( tour && find( relevantFeatures, { tour } ) ) {
			return { tour, _timestamp };
		}
	},
	[ getInitialQueryArguments, getCurrentQueryArguments ]
);

/*
 * Returns true if `tour` has been seen in the current Calypso session, false
 * otherwise.
 */
const hasJustSeenTour = ( state, { tour, _timestamp } ) =>
	getToursHistory( state ).some(
		( entry ) => entry.tourName === tour && entry.timestamp > _timestamp
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
	return find( newTours, ( tour ) => {
		const { when = constant( true ) } = find( relevantFeatures, { tour } );
		return when( state );
	} );
};

const isSectionBlacklisted = ( state ) => includes( BLACKLISTED_SECTIONS, getSectionName( state ) );

export const hasTourJustBeenVisible = createSelector(
	( state, now = Date.now() ) => {
		const last = findLast( getActionLog( state ), {
			type: GUIDED_TOUR_UPDATE,
			shouldShow: false,
		} );
		// threshold is one minute
		return last && now - last.timestamp < 60000;
	},
	[ getActionLog ]
);

const shouldBailAllTours = ( state ) => isSectionBlacklisted( state );

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
 * This includes the raw state from state/ui/guidedTour, but also the available
 * configuration (`stepConfig`) for the currently active tour step, if one is
 * active.
 *
 * @param  {object}  state Global state tree
 * @returns {object}        Current Guided Tours state
 */
const getRawGuidedTourState = ( state ) => get( state, 'ui.guidedTour', false );

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
