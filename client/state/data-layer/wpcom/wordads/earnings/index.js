/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { WORDADS_EARNINGS_REQUEST } from 'state/action-types';

export default {
	[ WORDADS_EARNINGS_REQUEST ]: dispatchRequestEx( {
		fetch: action => http( `/sites/${ action.siteId }/wordads/earnings`, action ),
		onSuccess: ( { siteId }, { earnings } ) => receiveEarnings( siteId, earnings ),
		onError: ( action, error ) => errorNotice( error ),
	} ),
};
