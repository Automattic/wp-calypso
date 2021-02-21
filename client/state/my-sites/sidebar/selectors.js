/**
 * Internal dependencies
 */
import 'calypso/state/my-sites/init';

export const isSidebarSectionOpen = ( state, section ) =>
	state.mySites.sidebarSections[ section ]?.isOpen;
