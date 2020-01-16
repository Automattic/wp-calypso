/**
 * Internal dependencies
 */
import { wpcomRequest } from '../utils';
import { CreateAccountAction } from './types';

export default {
	CREATE_ACCOUNT: async ( action: CreateAccountAction ) => {
		try {
			const { params } = action;
			const request = {
				path: '/users/new',
				apiVersion: '1.1',
				method: 'post',
				body: {
					email: params?.email,
					is_passwordless: true,
					signup_flow_name: 'gutenboarding',
					validate: false,
					client_id: '39911',
					client_secret: 'cOaYKdrkgXz8xY7aysv4fU6wL6sK5J8a6ojReEIAPwggsznj4Cb6mW0nffTxtYT8',
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
