/**
 * Internal dependencies
 */
import { HELP_SELECTED_SITE } from 'state/action-types';

export const selectSiteId = ( siteId ) => ( {
	type: HELP_SELECTED_SITE, siteId
} );
