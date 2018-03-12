/** @format */
/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { LOGSTASH } from 'state/action-types';

const logToLogstash = action =>
	http( {
		method: 'POST',
		apiVersion: '1.1',
		path: '/logstash',
		body: action.params,
	} );

export default {
	[ LOGSTASH ]: [ dispatchRequestEx( { fetch: logToLogstash, onSuccess: noop, onError: noop } ) ],
};
