import {
	INVITES_REQUEST,
} from 'state/action-types';

export const requestInvites = siteId => ( {
	type: INVITES_REQUEST,
	siteId: siteId
} );
