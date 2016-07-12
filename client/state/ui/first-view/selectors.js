/** @ssr-ready **/

/**
 * External dependencies
 */
import filter from 'lodash/filter';
import some from 'lodash/some';
import startsWith from 'lodash/startsWith';
import takeRightWhile from 'lodash/takeRightWhile';

/**
 * Internal dependencies
 */
import { FIRST_VIEW_START_DATES } from './constants';
import { getActionLog } from 'state/ui/action-log/selectors';
import { getPreference } from 'state/preferences/selectors';
import { getSectionName } from 'state/ui/selectors';

export function doesViewHaveFirstView( view ) {
	return !! ( FIRST_VIEW_START_DATES[ view ] );
}

export function isViewEnabled( state, view ) {
	const firstViewHistory = getPreference( state, 'firstViewHistory' ).filter( entry => entry.view === view );
	const latestFirstViewHistory = [...firstViewHistory].pop();
	const isViewDisabled = latestFirstViewHistory ? ( !! latestFirstViewHistory.disabled ) : false;
	return doesViewHaveFirstView( view ) && ! isViewDisabled;
}

export function wasViewHidden( state, view ) {
	return -1 !== state.ui.firstView.hidden.indexOf( view );
}

export function switchedToDifferentSection( state ) {
	const section = state.ui.section;
	const routeSets = filter( getActionLog( state ), entry => entry.type === 'ROUTE_SET' );
	const lastRouteSetsForSection = takeRightWhile( routeSets,
		routeSet => some( section.paths, path => startsWith( routeSet.path, path ) ) );
	return lastRouteSetsForSection.length === 1;
}

export function shouldViewBeVisible( state ) {
	const sectionName = getSectionName( state );

	return isViewEnabled( state, sectionName ) &&
		! wasViewHidden( state, sectionName ) &&
		switchedToDifferentSection( state );
}
