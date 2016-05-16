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
		const site = getSelectedSite( state );
		const { shouldReallyShow, stepName = '', tour } = tourState;
		const stepConfig = getToursConfig( tour )[ stepName ] || false;
		const nextStepConfig = getToursConfig( tour )[ stepConfig.next( site ) ] || false;

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
