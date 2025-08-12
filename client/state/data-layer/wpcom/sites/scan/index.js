import { omit } from 'lodash';
import {
	JETPACK_SCAN_UPDATE,
	JETPACK_SCAN_REQUEST,
	JETPACK_SCAN_REQUEST_SUCCESS,
	JETPACK_SCAN_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

/**
 * Make a Threat object response contain only camel-case keys and transform
 * dates represented as string to Date object.
 * @param {Object} threat Raw threat object from Scan endpoint
 * @returns {Object} Processed threat object
 */
export const formatScanThreat = ( threat ) => ( {
	id: threat.id,
	signature: threat.signature,
	description: threat.description,
	status: threat.status,
	firstDetected: threat.first_detected ? new Date( threat.first_detected ) : undefined,
	fixedOn: threat.fixed_on ? new Date( threat.fixed_on ) : undefined,
	fixable: threat.fixable,
	fixerStatus: threat.fixer_status,
	filename: threat.filename,
	extension: threat.extension,
	rows: threat.rows,
	diff: threat.diff,
	table: threat.table,
	primaryKeyColumn: threat.pk_column,
	value: threat.value,
	details: threat.details,
	context: threat.context,
	severity: threat.severity,
	source: threat.source,
	version: threat.version,
} );

/**
 * Make a Scan object response contain only camel-case keys and transform
 * dates represented as string to Date object.
 * @param {Object} scanState Raw Scan state object from Scan endpoint
 * @param {string} scanState.state State of the scan. E.g. "idle"
 * @param {Object[]} scanState.threats Array of active threats
 * @param {Object} scanState.most_recent Info about the most recent scan
 * @param {Object} scanState.current Info about the current scan
 * @returns {Object} Processed Scan state
 */
const formatScanStateRawResponse = ( {
	state,
	threats,
	most_recent: mostRecent,
	current,
	...rest
} ) => {
	if ( ! threats ) {
		threats = [];
	}
	return {
		state,
		threats: threats.map( formatScanThreat ),
		mostRecent: mostRecent
			? {
					...omit( mostRecent, [ 'is_initial' ] ),
					isInitial: mostRecent.is_initial,
			  }
			: undefined,
		current: current
			? {
					...omit( current, [ 'is_initial' ] ),
					isInitial: current.is_initial,
			  }
			: undefined,
		...rest,
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
		return setTimeout( () => {
			dispatch( {
				type: JETPACK_SCAN_REQUEST,
				siteId: action.siteId,
				pooling: true,
			} );
		}, POOL_EVERY_MILLISECONDS );
	}

	// We want to pool again if the last scan state included threats that are being fixed
	const threatsFixedInProgress = ( scan.threats || [] ).filter(
		( threat ) => threat.fixerStatus === 'in_progress'
	);
	if ( action.pooling && scan.state === 'idle' && threatsFixedInProgress.length > 0 ) {
		return setTimeout( () => {
			dispatch( {
				type: JETPACK_SCAN_REQUEST,
				siteId: action.siteId,
				pooling: true,
				retryCount: ( action.retryCount || 0 ) + 1,
			} );
		}, POOL_EVERY_MILLISECONDS );
	}
};

const onFetchStatusFailure =
	( { siteId } ) =>
	( dispatch ) => {
		dispatch( {
			type: JETPACK_SCAN_REQUEST_FAILURE,
			siteId,
		} );
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
