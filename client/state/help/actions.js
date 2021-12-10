import { HELP_CONTACT_FORM_SITE_SELECT } from 'calypso/state/action-types';

import 'calypso/state/help/init';

export const selectSiteId = ( siteId ) => ( {
	type: HELP_CONTACT_FORM_SITE_SELECT,
	siteId,
} );
