/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getState = ( state: State ) => state;
export const getSelectedSite = ( state: State ) => state.selectedSite;
export const hasPaidDomain = ( state: State ): boolean => {
	if ( ! state.domain ) {
		return false;
	}
	return ! state.domain.is_free;
};
export const getSelectedDesign = ( state: State ) => state.selectedDesign;
export const getSelectedFonts = ( state: State ) => state.selectedFonts;
export const getSelectedVertical = ( state: State ) => state.siteVertical;
export const getSelectedDomain = ( state: State ) => state.domain;
export const getSelectedSiteTitle = ( state: State ) => state.siteTitle;
