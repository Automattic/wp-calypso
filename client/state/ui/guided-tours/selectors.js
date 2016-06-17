/**
 * External dependencies
 */
import get from 'lodash/get';
import memoize from 'lodash/memoize';
import startsWith from 'lodash/startsWith';

/**
 * Internal dependencies
 */
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

const tourCandidates = [
	{
		name: 'themes',
		test: ( { type, path } ) =>
			type === 'SET_ROUTE' && startsWith( path, '/design' ),
	},
];

const findEligibleTour = createSelector(
		state => {
			let tourName;
			tourCandidates.some( ( { name, test } ) => {
				if ( getTourTriggers( state ).some( test ) ) {
					tourName = name;
					return true;
				}
			} );
			return tourName;
		},
		state => [
			getTourTriggers( state ),
		]
);

export const getGuidedTourState = createSelector(
	state => {
		const tourState = getRawGuidedTourState( state );
		const { stepName = 'init' } = tourState;
		let { shouldReallyShow, tour } = tourState;

		if ( ! tour ) {
			//console.log( 'no tour, finding one' );
			tour = findEligibleTour( state );
			if ( tour ) shouldReallyShow = true;
			//console.log( 'found', tour );
		}

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

		return Object.assign( {}, tourState, {
			stepConfig,
			nextStepConfig,
			shouldShow,
		} );
	},
	state => [
		getRawGuidedTourState( state ),
		isSectionLoading( state ),
		getTourTriggers( state ),
	]
);
