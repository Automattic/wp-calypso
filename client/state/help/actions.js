import {
	HELP_CONTACT_FORM_SITE_SELECT,
	SUPPORT_HISTORY_REQUEST,
	SUPPORT_HISTORY_SET,
	SUPPORT_LEVEL_SET,
} from 'calypso/state/action-types';

// Support History data needs to be disabled temporarily to avoid rate-limiting with our Zendesk API.
// It is only used for non-essential read-only operations right now.
// import 'calypso/state/data-layer/wpcom/help/support-history';
import 'calypso/state/help/init';

export const selectSiteId = ( siteId ) => ( {
	type: HELP_CONTACT_FORM_SITE_SELECT,
	siteId,
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
