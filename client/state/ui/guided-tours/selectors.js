/**
 * External dependencies
 */
import get from 'lodash/get';
import memoize from 'lodash/memoize';

/**
 * Internal dependencies
 */
import { isSectionLoading } from 'state/ui/selectors';
import createSelector from 'lib/create-selector';
import guidedToursConfig from 'layout/guided-tours/config';

const getToursConfig = memoize( () => guidedToursConfig.get() );

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
		const { shouldReallyShow, stepName = '' } = tourState;
		const stepConfig = getToursConfig()[ stepName ] || false;
		return Object.assign( {}, tourState, {
			stepConfig,
			shouldShow: !!( ! isSectionLoading( state ) && shouldReallyShow ),
		} );
	},
	state => [ getRawGuidedTourState( state ), isSectionLoading( state ) ]
);
