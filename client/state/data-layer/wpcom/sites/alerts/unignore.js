import i18n from 'i18n-calypso';
import { REWIND_STATE_UPDATE } from 'calypso/state/action-types';
import { transformApi } from 'calypso/state/data-layer/wpcom/sites/rewind/api-transformer';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

export const request = ( action ) => {
	const notice = successNotice( i18n.translate( 'Unignoring threat…' ), { duration: 30000 } );
	const {
		notice: { noticeId },
	} = notice;

	return [
		notice,
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				path: `/sites/${ action.siteId }/alerts/${ action.threatId }?unignore=true`,
				body: {},
			},
			{ ...action, noticeId }
		),
	];
};

export const success = ( action, rewind_state ) => [
	successNotice( i18n.translate( 'Threat unignored.' ), {
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
	errorNotice( i18n.translate( 'Error unignoring threat. Please contact support.' ), {
		duration: 10000,
		id: action.noticeId,
	} );
