/**
 * External dependencies
 */
import request from 'wpcom-xhr-request';

export const send = async ( report: Report ): Promise< boolean > => {
	request( {
		method: 'POST',
		apiVersion: '1.1',
		path: '/logstash',
		body: {
			params: report.toJSON(),
		},
	} );
	return true;
};
