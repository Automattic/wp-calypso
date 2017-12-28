/** @format */

/**
 * Internal dependencies
 */

import { HELP_CONTACT_FORM_SITE_SELECT } from 'client/state/action-types';

export const selectSiteId = siteId => ( {
	type: HELP_CONTACT_FORM_SITE_SELECT,
	siteId,
} );
