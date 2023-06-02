import request from 'wpcom-proxy-request';

export const send = async ( payload: Record< string, unknown > ): Promise< boolean > => {
	return request( {
		method: 'POST',
		apiVersion: '1.1',
		path: '/logstash',
		body: {
			params: JSON.stringify( {
				feature: 'calypso_client',
				message: 'perf.nav',
				properties: payload,
			} ),
		},
	} );
};
