/** @ssr-ready **/

/**
 * External dependencies
 */
import get from 'lodash/get';
import memoize from 'lodash/memoize';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSite } from 'state/sites/selectors';
import guidedToursConfig from 'layout/guided-tours/config';

const getToursConfig = memoize( () => guidedToursConfig.get() );

/**
 * Returns the site object for the currently selected site.
 *
 * @param  {Object}  state  Global state tree
 * @return {?Object}        Selected site
 */
export function getSelectedSite( state ) {
	const siteId = getSelectedSiteId( state );
	if ( ! siteId ) {
		return null;
	}

	return getSite( state, siteId );
}

/**
 * Returns the currently selected site ID.
 *
 * @param  {Object}  state Global state tree
 * @return {?Number}       Selected site ID
 */
export function getSelectedSiteId( state ) {
	return state.ui.selectedSiteId;
}

/**
 * Returns the current section name.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       Current section name
 */
export function getSectionName( state ) {
	return get( state.ui.section, 'name', null );
}

/**
 * Returns whether a section is loading.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether the section is loading
 */
export function isSectionLoading( state ) {
	return state.ui.isLoading;
}

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
