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
import { ROUTE_SET } from 'state/action-types';
import { isSectionLoading } from 'state/ui/selectors';
import { getActionLog } from 'state/ui/action-log/selectors';
import { getPreference } from 'state/preferences/selectors';
import createSelector from 'lib/create-selector';
import guidedToursConfig from 'layout/guided-tours/config';

const getToursConfig = memoize( ( tour ) => guidedToursConfig.get( tour ) );
const getToursHistory = state => getPreference( state, 'guided-tours-history' );

/**
 * This would/will be part of the existing config for tours.
 */
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

const getToursFromFeaturesReached = createSelector(
	state => (
		uniq( getActionLog( state )
			.filter( ( { type } ) => type === ROUTE_SET )
			.reduce( ( allTours, { path: triggerPath } ) => {
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

const getToursSeen = createSelector(
	state => uniq(
		getToursHistory( state )
			.map( ( { tourName } ) => tourName )
	),
	getToursHistory
);

const findEligibleTour = createSelector(
	state => {
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
		return newTours.find( tour => {
			const { context = noop } = find( relevantFeatures, { tour } );
			return context( state );
		} );
	},
	getActionLog
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
		const { stepName = 'init' } = tourState;

		// note how we don't care about these:
		// let { shouldReallyShow, tour } = tourState;

		let { tour } = tourState;

		if ( ! tour ) {
			tour = findEligibleTour( state );
		}

		const shouldReallyShow = !! tour;

		console.log( 'tours reached', getToursFromFeaturesReached( state ) );
		console.log( 'tours seen', getToursSeen( state ) );
		console.log( 'found', tour );

		if ( ! tour ) {
			return {
				...tourState,
				shouldShow: false,
				stepConfig: false,
				nextStepConfig: false,
			};
		}

		const tourConfig = getToursConfig( tour );

		// TODO: move out of getGuidedTourState
		const getStepConfig = name => {
			const step = tourConfig[ name ] || false;
			const shouldSkip = !! (
				step &&
				( step.showInContext && ! step.showInContext( state ) ) ||
				( step.continueIf && step.continueIf( state ) )
			);
			return shouldSkip ? getStepConfig( step.next ) : step;
		};

		const stepConfig = getStepConfig( stepName ) || false;
		const nextStepConfig = getStepConfig( stepConfig.next ) || false;

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
