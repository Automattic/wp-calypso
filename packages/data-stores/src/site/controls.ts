/**
 * Internal dependencies
 */
import { wpcomRequest, WpcomClientCredentials } from '../utils';
import { ActionType, CreateSiteAction } from './types';

export default function createControls( clientCreds: WpcomClientCredentials ) {
	return {
		[ ActionType.CREATE_SITE ]: async ( action: CreateSiteAction ) => {
			const { authToken, ...providedParams } = action.params;
			const defaultParams = {
				blog_title: '',
				public: -1,
				blog_name: '',
				client_id: clientCreds.client_id,
				client_secret: clientCreds.client_secret,
				lang_id: 1,
				locale: 'en',
				options: {
					theme: 'pub/maywood',
					site_segment: 1,
					site_vertical: 'p1',
					site_vertical_name: 'Restaurant',
					site_information: {
						title: 'Test Site for Gutenboarding',
					},
					site_creation_flow: 'gutenboarding',
				},
			};
			const mergedParams = Object.assign(
				{},
				defaultParams,
				{ ...providedParams },
				{ validate: false } // Set to false because account validation should be a separate action
			);
			const newUser = await wpcomRequest( {
				path: '/sites/new',
				apiVersion: '1.1',
				method: 'post',
				body: mergedParams,
				token: authToken || undefined,
			} );
			return newUser;
		},
	};
}
