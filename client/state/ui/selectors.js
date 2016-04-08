/** @ssr-ready **/

/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';
import guidesToursConfig from 'guidestours/config';

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

export function getGuidesTourState( state ) {
	const { shouldShow, stepName = '' } = state.ui.guidesTour;
	const stepConfig = guidesToursConfig[ stepName ] || false;
	return Object.assign( {}, state.ui.guidesTour, {
		stepConfig,
		showPreview: shouldShow && stepConfig.showPreview,
	} );
}
