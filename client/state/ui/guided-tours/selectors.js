/**
 * External dependencies
 */
import get from 'lodash/get';
import difference from 'lodash/difference';
import find from 'lodash/find';
import memoize from 'lodash/memoize';
import noop from 'lodash/noop';
import startsWith from 'lodash/startsWith';
import uniq from 'lodash/uniq';

/**
 * Internal dependencies
 */
import {
	SET_ROUTE,
	GUIDED_TOUR_UPDATE,
} from 'state/action-types';
import { isSectionLoading } from 'state/ui/selectors';
import createSelector from 'lib/create-selector';
import guidedToursConfig from 'layout/guided-tours/config';

const getToursConfig = memoize( ( tour ) => guidedToursConfig.get( tour ) );

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

const getTourTriggers = state => get( state, 'ui.tourTriggers', [] );

const relevantFeatures = [
	{
		path: '/',
		tour: 'main',
		// obviously a hack
		context: () => -1 !== location.search.indexOf( 'tour=main' )
	},
	{
		path: '/design',
		tour: 'themes',
		context: state => true // eslint-disable-line no-unused-vars
	},
];

const getFeaturesReached = createSelector(
	state => (
		getTourTriggers( state )
			.filter( ( { type } ) => type === SET_ROUTE )
			.reduce( ( allFeatures, { path: triggerPath } ) => {
				const newFeatures = relevantFeatures
					.filter( ( { path: featurePath } ) =>
						startsWith( triggerPath, featurePath ) );

				return newFeatures
					? uniq( [ ...allFeatures, ...newFeatures ] )
					: allFeatures;
			}, [] )
	),
	state => getTourTriggers( state )
);

const getToursFromFeaturesReached = ( state ) =>
	getFeaturesReached( state ).map( feature => feature.tour );

const getToursSeen = ( state ) =>
	getTourTriggers( state )
		.filter( ( { type } ) => type === GUIDED_TOUR_UPDATE )
		.filter( ( { shouldShow } ) => false === shouldShow )
		.map( ( { tour } ) => tour );

const findEligibleTour = createSelector(
	state => {
		const toursFromTriggers = uniq( [
			// Right now, only one source from which to derive tours, but we may
			// have more later.
			...getToursFromFeaturesReached( state )
		] );

		const toursToDismiss = uniq( [
			// Same idea here.
			...getToursSeen( state )
		] );

		const newTours = difference( toursFromTriggers, toursToDismiss );
		return newTours.find( tour => {
			const { context = noop } = find( relevantFeatures, { tour } );
			return context( state );
		} );
	},
	state => getTourTriggers( state )
);

export const getGuidedTourState = createSelector(
	state => {
		const tourState = getRawGuidedTourState( state );
		const { stepName = 'init' } = tourState;

		// note how we don't care about these:
		//let { shouldReallyShow, tour } = tourState;

		const tour = findEligibleTour( state );
		const shouldReallyShow = !! tour;

		console.log( 'tours reached', getToursFromFeaturesReached( state ) );
		console.log( 'tours seen', getToursSeen( state ) );
		console.log( 'found', tour );

		const tourConfig = getToursConfig( tour );

		const getStep = s => {
			const shouldSkip = !! (
				tourConfig[ s ].showInContext && ! tourConfig[ s ].showInContext( state ) ||
				tourConfig[ s ].continueIf && tourConfig[ s ].continueIf( state )
			);
			console.log( 'current should skip/continue', shouldSkip );
			return shouldSkip ? getStep( tourConfig[ s ].next ) : tourConfig[ s ];
		};

		const stepConfig = getStep( stepName ) || false;
		const nextStepConfig = tourConfig[ stepConfig.next ] || false;

		console.log( 'current', stepConfig, 'next', nextStepConfig );

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
	state => [
		getRawGuidedTourState( state ),
		isSectionLoading( state ),
		getTourTriggers( state ),
	]
);
