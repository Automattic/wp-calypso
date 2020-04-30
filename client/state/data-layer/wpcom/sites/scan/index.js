/**
 * Internal dependencies
 */
import { registerHandlers } from 'state/data-layer/handler-registry';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	JETPACK_SCAN_UPDATE,
	JETPACK_SCAN_REQUEST,
	JETPACK_SCAN_REQUEST_SUCCESS,
	JETPACK_SCAN_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Make a Threat object response contain only camel-case keys and transform
 * dates represented as string to Date object.
 *
 * @param {object} threat Raw threat object from Scan endpoint
 * @returns {object} Processed threat object
 */
export const formatScanThreat = ( threat ) => ( {
	id: threat.id,
	signature: threat.signature,
	description: threat.description,
	status: threat.status,
	firstDetected: new Date( threat.first_detected ),
	fixedOn: new Date( threat.fixed_on ),
	fixable: threat.fixable,
	filename: threat.filename,
	extension: threat.extension,
	rows: threat.rows,
	diff: threat.diff,
	context: threat.context,
} );

/**
 * Make a Scan object response contain only camel-case keys and transform
 * dates represented as string to Date object.
 *
 * @param {object} scanState Raw Scan state object from Scan endpoint
 * @returns {object} Processed Scan state
 */
const formatScanStateRawResponse = ( { state, threats, credentials, most_recent: mostRecent } ) => {
	return {
		state,
		threats: threats.map( formatScanThreat ),
		credentials,
		mostRecent: mostRecent
			? {
					...mostRecent,
					timestamp: new Date( mostRecent.timestamp ),
					isInitial: mostRecent.is_initial,
			  }
			: null,
	};
};

const fetchStatus = ( action ) => {
	return http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/scan`,
		},
		action
	);
};

const POOL_EVERY_MILLISECONDS = 5000;

const onFetchStatusSuccess = ( action, scan ) => ( dispatch ) => {
	[
		{
			type: JETPACK_SCAN_REQUEST_SUCCESS,
			siteId: action.siteId,
		},
		{
			type: JETPACK_SCAN_UPDATE,
			siteId: action.siteId,
			payload: scan,
		},
	].map( dispatch );
	if ( action.pooling && scan.state === 'scanning' ) {
		setTimeout( () => {
			dispatch( {
				type: JETPACK_SCAN_REQUEST,
				siteId: action.siteId,
				pooling: true,
			} );
		}, POOL_EVERY_MILLISECONDS );
	}
};

const onFetchStatusFailure = ( ...response ) => {
	return [
		{
			type: JETPACK_SCAN_REQUEST_FAILURE,
			siteId: response.siteId,
		},
	];
};

registerHandlers( 'state/data-layer/wpcom/sites/scan', {
	[ JETPACK_SCAN_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchStatus,
			onSuccess: onFetchStatusSuccess,
			onError: onFetchStatusFailure,
			fromApi: formatScanStateRawResponse,
		} ),
	],
} );
