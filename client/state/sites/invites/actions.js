import {
	INVITES_REQUEST,
	INVITES_RECEIVE,
} from 'state/action-types';

export const invitesReceiveAction = invites => {
	return {
		type: INVITES_RECEIVE,
		invites
	};
};

export const requestInvites = siteId => ( {
	type: INVITES_REQUEST,
	siteId: siteId
} );
