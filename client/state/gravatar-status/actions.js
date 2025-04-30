import { GRAVATAR_DETAILS_REQUEST, GRAVATAR_DETAILS_RECEIVE } from 'calypso/state/action-types';

import 'calypso/state/gravatar-status/init';
import 'calypso/state/data-layer/wpcom/gravatar-upload';
import 'calypso/state/data-layer/wpcom/me/gravatar';

export function requestGravatarDetails() {
	return {
		type: GRAVATAR_DETAILS_REQUEST,
	};
}

export function receiveGravatarDetails( gravatarDetails ) {
	return {
		type: GRAVATAR_DETAILS_RECEIVE,
		gravatarDetails,
	};
}
