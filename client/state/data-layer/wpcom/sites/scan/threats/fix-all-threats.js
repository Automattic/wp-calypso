/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { JETPACK_SCAN_THREATS_FIX_ALL } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import {
	updateThreat,
	updateThreatCompleted,
	getFixThreatsStatus,
} from 'calypso/state/jetpack-scan/threats/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { errorNotice, successNotice, infoNotice } from 'calypso/state/notices/actions';

export const request = ( action ) => {
	const notice = successNotice( i18n.translate( 'Fixing all threats…' ), { duration: 30000 } );
	const {
		notice: { noticeId },
	} = notice;

	return [
		notice,
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				path: `/sites/${ action.siteId }/alerts/fix`,
				body: { threat_ids: action.threatIds },
			},
			{ ...action, noticeId }
		),
		...action.threatIds.map( ( threatId ) => updateThreat( action.siteId, threatId ) ),
	];
};

// We don't have a wait to only execute this path if all request succeeded.
export const success = ( action ) => [
	infoNotice(
		i18n.translate(
			"We're hard at work fixing these threats in the background. Please check back shortly."
		),
		{
			duration: 4000,
			id: action.noticeId,
		}
	),
	getFixThreatsStatus( action.siteId, action.threatIds ),
];

// Not sure if this is even going to happen. Maybe if all of them fail.
export const failure = ( action ) => [
	errorNotice( i18n.translate( 'Error fixing threats. Please contact support.' ), {
		duration: 10000,
		id: action.noticeId,
	} ),
	...action.threatIds.map( ( threatId ) => updateThreatCompleted( action.siteId, threatId ) ),
];

registerHandlers( 'state/data-layer/wpcom/sites/scan/threats/fix-all-threats.js', {
	[ JETPACK_SCAN_THREATS_FIX_ALL ]: [
		dispatchRequest( {
			fetch: request,
			onSuccess: success,
			onError: failure,
		} ),
	],
} );
