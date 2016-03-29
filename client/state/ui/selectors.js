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
import guidesToursConfig from 'guidestours/config';

const getToursConfig = memoize( () => guidesToursConfig.get() );

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
 * Returns true if the current section is isomorphic.
 *
 * @param  {Object}  state Global state tree
 * @return {bool}    True if current section is isomorphic
 *
 * @see client/sections
 */
export function isSectionIsomorphic( state ) {
	return get( state.ui.section, 'isomorphic', false );
}

/**
 * Returns the current state for Guided Tours.
 *
 * This includes the raw state from state/ui/guidesTour, but also the available
 * configuration (`stepConfig`) for the currently active tour step, if one is
 * active.
 *
 * @param  {Object}  state Global state tree
 * @return {Object}        Current Guided Tours state
 */
const getRawGuidesTourState = state => get( state, 'ui.guidesTour', false );
export const getGuidesTourState = createSelector(
	state => {
		const tourState = getRawGuidesTourState( state );
		const { shouldReallyShow, stepName = '' } = tourState;
		const stepConfig = getToursConfig()[ stepName ] || false;
		return Object.assign( {}, tourState, {
			stepConfig,
			shouldShow: shouldReallyShow || false,
		} );
	},
	getRawGuidesTourState
);
