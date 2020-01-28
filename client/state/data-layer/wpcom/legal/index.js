/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { LEGAL_REQUEST } from 'state/action-types';
import { setLegalData } from 'state/legal/actions';

const requestLegalData = action => {
	return http(
		{
			method: 'GET',
			path: `/legal`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

const storeLegalData = ( action, legalData ) => setLegalData( legalData );

const formatLegalData = ( { tos: { accepted, effective_date } } ) => {
	return {
		tos: {
			accepted,
			effectiveDate: effective_date,
		},
	};
};

registerHandlers( 'state/data-layer/legal/index.js', {
	[ LEGAL_REQUEST ]: [
		dispatchRequest( {
			fetch: requestLegalData,
			onSuccess: storeLegalData,
			fromApi: formatLegalData,
		} ),
	],
} );
