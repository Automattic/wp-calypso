/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { LOGSTASH } from 'state/action-types';

const logToLogstash = ( { dispatch }, action ) => dispatch(
	http( {
		method: 'POST',
		apiVersion: '1.1',
		path: '/logstash',
		body: action.params,
	} )
);

export default {
	[ LOGSTASH ]: [ ( store, action ) => logToLogstash( store, action ) ],
};

