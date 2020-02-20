/**
 * Internal dependencies
 */
import {
	HELP_CONTACT_FORM_SITE_SELECT,
	HELP_LINKS_RECEIVE,
	HELP_LINKS_REQUEST,
} from 'state/action-types';

import 'state/data-layer/wpcom/help/search';

export const selectSiteId = siteId => ( {
	type: HELP_CONTACT_FORM_SITE_SELECT,
	siteId,
} );

export const requestHelpLinks = query => ( {
	type: HELP_LINKS_REQUEST,
	query,
} );

export const receiveHelpLinks = helpLinks => ( {
	type: HELP_LINKS_RECEIVE,
	helpLinks,
} );
