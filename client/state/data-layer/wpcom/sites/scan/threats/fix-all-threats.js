/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { JETPACK_SCAN_THREATS_FIX_ALL } from 'state/action-types';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { requestScanStatus } from 'state/jetpack-scan/actions';
import { updateThreat, updateThreatCompleted } from 'state/jetpack-scan/threats/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, successNotice } from 'state/notices/actions';

export const request = ( action ) => {
	const notice = successNotice( i18n.translate( 'Fixing all threats…' ), { duration: 30000 } );
	const {
		notice: { noticeId },
	} = notice;

	return [
		notice,
		...action.threatIds.map( ( threatId ) =>
			http(
				{
					apiNamespace: 'wpcom/v2',
					method: 'POST',
					path: `/sites/${ action.siteId }/alerts/${ threatId }?fix=true`,
					body: {},
				},
				{ ...action, noticeId }
			)
		),
		...action.threatIds.map( ( threatId ) => updateThreat( action.siteId, threatId ) ),
	];
};

export const success = ( action ) => [
	successNotice(
		i18n.translate(
			"We're hard at work fixing these threats in the background. Please check back shortly."
		),
		{
			duration: 4000,
			id: action.noticeId,
		}
	),
	requestScanStatus( action.siteId, false ),
];

export const failure = ( action ) => [
	errorNotice( i18n.translate( 'Error fixing threat. Please contact support.' ), {
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
