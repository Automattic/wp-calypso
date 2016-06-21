/**
 * External dependencies
 */
import get from 'lodash/get';
import memoize from 'lodash/memoize';

/**
 * Internal dependencies
 */
import { isSectionLoading, getSelectedSite } from 'state/ui/selectors';
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

export const getGuidedTourState = createSelector(
	state => {
		const tourState = getRawGuidedTourState( state );
		const { shouldReallyShow, stepName = '', tour } = tourState;
		const tourConfig = getToursConfig( tour );

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

		return Object.assign( {}, tourState, {
			stepConfig,
			nextStepConfig,
			shouldShow,
		} );
	},
	state => [
		getRawGuidedTourState( state ),
		isSectionLoading( state ),
		getSelectedSite( state ),
	]
);
