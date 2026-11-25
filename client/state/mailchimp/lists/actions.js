import { MAILCHIMP_LISTS_LIST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/mailchimp';
import 'calypso/state/mailchimp/init';

export const requestList = ( siteId ) => ( {
	siteId,
	type: MAILCHIMP_LISTS_LIST,
} );
