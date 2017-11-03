import { INVITES_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { invitesReceiveAction } from 'state/sites/invites/actions';

export const fetchInvites = ( { dispatch }, action ) => {
	const { siteId } = action;

	dispatch( http(
		{
			method: 'GET',
			path: `/sites/${ siteId }/invites`,
			apiVersion: '1.1'
		},
		action
	) );
};

export const receiveInvites = ( {dispatch}, action, invites ) => {
	dispatch( invitesReceiveAction( invites ) );
};

export const receiveError = ( { dispatch }, action, rawError ) => {
	//TODO: implement
};

export default {
	[ INVITES_REQUEST ]: [ dispatchRequest( fetchInvites, receiveInvites, receiveError ) ],
};
