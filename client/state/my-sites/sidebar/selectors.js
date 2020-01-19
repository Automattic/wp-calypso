/**
 * External dependencies
 */

import { get } from 'lodash';

export const isSidebarSectionOpen = ( state, section ) =>
	get( state, `mySites.sidebarSections.${ section }.isOpen` );
