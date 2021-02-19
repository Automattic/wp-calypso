/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { LOGSTASH } from 'calypso/state/action-types';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

const logToLogstash = ( action ) =>
	http( {
		method: 'POST',
		apiVersion: '1.1',
		path: '/logstash',
		body: action.params,
	} );

registerHandlers( 'state/data-layer/wpcom/logstash/index.js', {
	[ LOGSTASH ]: [ dispatchRequest( { fetch: logToLogstash, onSuccess: noop, onError: noop } ) ],
} );
