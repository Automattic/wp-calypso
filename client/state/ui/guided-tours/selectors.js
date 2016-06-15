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
		const { stepName = '' } = tourState;
		let { shouldReallyShow, tour } = tourState;

		if ( ! tour ) {
			console.log( 'no tour, finding one' );
			tour = findEligibleTour( state );
			console.log( 'found', tour );
		}

		const tourConfig = getToursConfig( tour );
		const stepConfig = tourConfig[ stepName ] || false;
		const nextStepConfig = getToursConfig( tour )[ stepConfig.next ] || false;

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
