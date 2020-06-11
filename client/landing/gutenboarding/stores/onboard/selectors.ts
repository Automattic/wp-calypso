/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { State } from './reducer';
import { USER_STORE } from '../user';

export const getIsRedirecting = ( state: State ) => state.isRedirecting;
export const getState = ( state: State ) => state;
export const getSelectedSite = ( state: State ) => state.selectedSite;
export const hasPaidDomain = ( state: State ): boolean => {
	if ( ! state.domain ) {
		return false;
	}
	return ! state.domain.is_free;
};
export const hasPaidDesign = ( state: State ): boolean => {
	if ( ! state.selectedDesign ) {
		return false;
	}
	return state.selectedDesign.is_premium;
};
export const getSelectedDesign = ( state: State ) => state.selectedDesign;
export const getSelectedFonts = ( state: State ) => state.selectedFonts;
export const getSelectedVertical = ( state: State ) => state.siteVertical;
export const getSelectedDomain = ( state: State ) => state.domain;
export const getSelectedSiteTitle = ( state: State ) => state.siteTitle;
export const getDomainSearch = ( state: State ) =>
	state.domainSearch ||
	getSelectedSiteTitle( state ) ||
	getSelectedVertical( state )?.label.trim() ||
	select( USER_STORE ).getCurrentUser()?.username;
