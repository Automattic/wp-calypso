/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { WORDADS_STATUS_REQUEST } from 'state/action-types';
import { receiveStatus } from 'state/wordads/status/actions';

export default {
	[ WORDADS_STATUS_REQUEST ]: dispatchRequestEx( {
		fetch: action => http( `/sites/${ action.siteId }/wordads/earnings`, action ),
		onSuccess: ( { siteId }, { earnings } ) => receiveStatus( siteId, earnings ),
		onError: ( action, error ) => errorNotice( error ),
	} ),
};
