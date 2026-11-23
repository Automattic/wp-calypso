import { GRAVATAR_DETAILS_RECEIVE } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { dispatchProfileCompleteNotice } from 'calypso/state/reader/onboarding/handlers';

registerHandlers( 'state/data-layer/wpcom/gravatar-upload/index.js', {
	[ GRAVATAR_DETAILS_RECEIVE ]: [ dispatchProfileCompleteNotice ],
} );
