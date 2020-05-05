/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { JETPACK_SITE_ALERT_THREAT_FIX, REWIND_STATE_UPDATE } from 'state/action-types';
import { errorNotice, successNotice } from 'state/notices/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { http } from 'state/data-layer/wpcom-http/actions';
import { transformApi } from 'state/data-layer/wpcom/sites/rewind/api-transformer';
import { requestScanStatus } from 'state/jetpack-scan/actions';

export const request = ( action ) => {
	const notice = successNotice( i18n.translate( 'Fixing threat…' ), { duration: 30000 } );
	const {
		notice: { noticeId },
	} = notice;

	return [
		notice,
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				path: `/sites/${ action.siteId }/alerts/${ action.threatId }?fix=true`,
				body: {},
			},
			{ ...action, noticeId }
		),
	];
};

export const success = ( action, rewind_state ) => [
	successNotice(
		i18n.translate(
			"We're hard at work fixing this threat in the background. Please check back shortly."
		),
		{
			duration: 4000,
			id: action.noticeId,
		}
	),
	/**
	 * The API transform could theoretically fail and the rewind data might
	 * be unavailable. Just let it go.
	 */
	( () => {
		try {
			return {
				type: REWIND_STATE_UPDATE,
				siteId: action.siteId,
				data: transformApi( rewind_state ),
			};
		} catch ( e ) {}
	} )(),
	...( action.requestScanState ? [ requestScanStatus( action.siteId, false ) ] : [] ),
];

export const failure = ( action ) =>
	errorNotice( i18n.translate( 'Error fixing threat. Please contact support.' ), {
		duration: 10000,
		id: action.noticeId,
	} );

registerHandlers( 'state/data-layer/wpcom/sites/alerts/fix.js', {
	[ JETPACK_SITE_ALERT_THREAT_FIX ]: [
		dispatchRequest( {
			fetch: request,
			onSuccess: success,
			onError: failure,
		} ),
	],
} );
