/** @format */

/**
 * External dependencies
 */

import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { JETPACK_CREDENTIALS_AUTOCONFIGURE, JETPACK_CREDENTIALS_STORE } from 'state/action-types';
import { successNotice, errorNotice } from 'state/notices/actions';

export const fetch = ( { dispatch }, action ) => {
	const notice = successNotice( i18n.translate( 'Obtaining your credentials…' ) );
	const { notice: { noticeId } } = notice;

	dispatch( notice );

	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: `/activity-log/${ action.siteId }/rewind/activate`,
			},
			{ ...action, noticeId }
		)
	);
};

export const storeAndAnnounce = ( { dispatch }, { siteId, noticeId } ) => {
	dispatch( {
		type: JETPACK_CREDENTIALS_STORE,
		credentials: { main: { type: 'auto' } }, // fake for now until data actually comes through
		siteId,
	} );

	dispatch(
		successNotice( i18n.translate( 'Your credentials have been auto configured.' ), {
			duration: 4000,
			id: noticeId,
		} )
	);
};

export const announceFailure = ( { dispatch }, { noticeId } ) => {
	dispatch(
		errorNotice( i18n.translate( 'Error auto configuring your credentials.' ), {
			duration: 4000,
			id: noticeId,
		} )
	);
};

export default {
	[ JETPACK_CREDENTIALS_AUTOCONFIGURE ]: [
		dispatchRequest( fetch, storeAndAnnounce, announceFailure ),
	],
};
