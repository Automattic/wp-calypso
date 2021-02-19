/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { LEGAL_REQUEST, TOS_ACCEPT } from 'calypso/state/action-types';
import { setLegalData } from 'calypso/state/legal/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const requestLegalData = ( action ) => {
	return http(
		{
			method: 'GET',
			path: `/legal`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

const storeLegalData = ( action, legalData ) => [
	setLegalData( legalData ),
	recordTracksEvent( 'calypso_tos_accept' ),
];

const formatLegalData = ( { tos: { accepted, active_date, display_prompt } } ) => {
	return {
		tos: {
			accepted,
			activeDate: active_date,
			displayPrompt: display_prompt,
		},
	};
};

const acceptTos = ( action ) => {
	return http(
		{
			method: 'POST',
			path: `/legal`,
			apiNamespace: 'wpcom/v2',
			body: {
				action: 'accept_tos',
			},
		},
		action
	);
};

registerHandlers( 'state/data-layer/legal/index.js', {
	[ LEGAL_REQUEST ]: [
		dispatchRequest( {
			fetch: requestLegalData,
			onSuccess: storeLegalData,
			fromApi: formatLegalData,
		} ),
	],
	[ TOS_ACCEPT ]: [
		dispatchRequest( {
			fetch: acceptTos,
			onSuccess: storeLegalData,
			fromApi: formatLegalData,
		} ),
	],
} );
