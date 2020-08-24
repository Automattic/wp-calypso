/**
 * External dependencies
 */

import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	JETPACK_CREDENTIALS_AUTOCONFIGURE,
	JETPACK_CREDENTIALS_STORE,
	REWIND_STATE_UPDATE,
} from 'state/action-types';
import { successNotice, errorNotice } from 'state/notices/actions';
import { requestRewindState } from 'state/rewind/state/actions';
import { transformApi } from 'state/data-layer/wpcom/sites/rewind/api-transformer';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetch = ( action ) => {
	const notice = successNotice( i18n.translate( 'Obtaining your credentials…' ) );
	const {
		notice: { noticeId },
	} = notice;

	return [
		notice,
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: `/activity-log/${ action.siteId }/rewind/activate`,
			},
			{ ...action, noticeId }
		),
	];
};

export const storeAndAnnounce = ( { siteId, noticeId }, { rewind_state } ) => [
	{
		type: JETPACK_CREDENTIALS_STORE,
		credentials: { main: { type: 'auto' } }, // fake for now until data actually comes through
		siteId,
	},

	successNotice( i18n.translate( 'Your credentials have been auto configured.' ), {
		duration: 4000,
		id: noticeId,
	} ),
	// right now the `/activate` endpoint returns before the
	// server realizes we're now in the 'active' state so we
	// need to make the additional update here to clear that up
	requestRewindState( siteId ),
	// the API transform could fail and the rewind data might
	// be unavailable so if that's the case just let it go
	// for now. we'll improve our rigor as time goes by.
	() => {
		try {
			return {
				type: REWIND_STATE_UPDATE,
				siteId,
				data: transformApi( rewind_state ),
			};
		} catch ( e ) {}
	},
];

export const announceFailure = ( { noticeId } ) =>
	errorNotice( i18n.translate( 'Error auto configuring your credentials.' ), {
		duration: 4000,
		id: noticeId,
	} );

registerHandlers( 'state/data-layer/wpcom/activity-log/rewind/activate/index.js', {
	[ JETPACK_CREDENTIALS_AUTOCONFIGURE ]: [
		dispatchRequest( {
			fetch,
			onSuccess: storeAndAnnounce,
			onError: announceFailure,
		} ),
	],
} );
