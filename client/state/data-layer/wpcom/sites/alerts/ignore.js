import i18n from 'i18n-calypso';
import { JETPACK_SITE_ALERT_THREAT_IGNORE, REWIND_STATE_UPDATE } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { transformApi } from 'calypso/state/data-layer/wpcom/sites/rewind/api-transformer';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

export const request = ( action ) => {
	const notice = successNotice( i18n.translate( 'Ignoring threat…' ), { duration: 30000 } );
	const {
		notice: { noticeId },
	} = notice;

	return [
		notice,
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				path: `/sites/${ action.siteId }/alerts/${ action.threatId }?ignore=true`,
				body: {},
			},
			{ ...action, noticeId }
		),
	];
};

export const success = ( action, rewind_state ) => [
	successNotice( i18n.translate( 'Threat ignored.' ), {
		duration: 4000,
		id: action.noticeId,
	} ),
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
];

export const failure = ( action ) =>
	errorNotice( i18n.translate( 'Error ignoring threat. Please contact support.' ), {
		duration: 10000,
		id: action.noticeId,
	} );

registerHandlers( 'state/data-layer/wpcom/sites/alerts/ignore.js', {
	[ JETPACK_SITE_ALERT_THREAT_IGNORE ]: [
		dispatchRequest( {
			fetch: request,
			onSuccess: success,
			onError: failure,
		} ),
	],
} );
