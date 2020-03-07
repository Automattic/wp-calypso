import createClient from './simperium-lib';
import { wpcom } from '../rest-client/wpcom';

const APP_ID = localStorage.getItem( 'wpnotes_app_id' );

export default async () => {
	const { token } = await wpcom().req.post( {
		path: '/me/simperium-tokens/new',
		apiVersion: 'v1.1',
		body: {
			api_key: localStorage.getItem( 'wpnotes_api_key' ),
		},
	} );

	const client = createClient( APP_ID, token, {} );

	return {
		meta: client.bucket( 'meta' ),
		notifications: client.bucket( 'note20' ),
	};
};
