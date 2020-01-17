/**
 * Internal dependencies
 */
import { wpcomRequest, WpcomClientCredentials } from '../utils';
import { CreateAccountAction } from './types';

// @TODO: pass in locale
export default function createControls( clientCreds: WpcomClientCredentials ) {
	return {
		CREATE_ACCOUNT: async ( action: CreateAccountAction ) => {
			try {
				const request = {
					path: '/users/new',
					apiVersion: '1.1',
					method: 'post',
					body: {
						email: action.params?.email,
						is_passwordless: true,
						signup_flow_name: 'gutenboarding',
						validate: false,
						client_id: clientCreds.client_id,
						client_secret: clientCreds.client_secret,
						locale: 'en',
					},
				};
				const newUser = await wpcomRequest( request );
				return newUser;
			} catch ( err ) {
				return undefined;
			}
		},
	};
}
