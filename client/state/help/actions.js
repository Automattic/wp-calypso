/**
 * Internal dependencies
 */
import {
	HELP_CONTACT_FORM_SITE_SELECT,
	HELP_LINKS_RECEIVE,
	HELP_LINKS_REQUEST,
	SUPPORT_HISTORY_REQUEST,
	SUPPORT_HISTORY_SET,
	SUPPORT_LEVEL_SET,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/help/search';
import 'calypso/state/data-layer/wpcom/help/support-history';
import 'calypso/state/help/init';

export const selectSiteId = ( siteId ) => ( {
	type: HELP_CONTACT_FORM_SITE_SELECT,
	siteId,
} );

export const requestHelpLinks = ( query ) => ( {
	type: HELP_LINKS_REQUEST,
	query,
} );

export const receiveHelpLinks = ( helpLinks ) => ( {
	type: HELP_LINKS_RECEIVE,
	helpLinks,
} );

export const requestSupportHistory = ( email ) => ( {
	type: SUPPORT_HISTORY_REQUEST,
	email,
} );

export const setSupportHistory = ( items ) => ( {
	type: SUPPORT_HISTORY_SET,
	items,
} );

export const setSupportLevel = ( level ) => ( {
	type: SUPPORT_LEVEL_SET,
	level,
} );
