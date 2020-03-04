/**
 * External dependencies
 */
import wpcomRequest, { requestAllBlogsAccess } from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import { CreateSiteAction } from './types';
import { WpcomClientCredentials } from '../shared-types';

export default function createControls( clientCreds: WpcomClientCredentials ) {
	requestAllBlogsAccess().catch( () => {
		throw new Error( 'Could not get all blog access.' );
	} );
	return {
		CREATE_SITE: async ( action: CreateSiteAction ) => {
			const { authToken, ...providedParams } = action.params;

			const defaultParams = {
				client_id: clientCreds.client_id,
				client_secret: clientCreds.client_secret,
				// will find an available `*.wordpress.com` url based on the `blog_name`
				find_available_url: true,
				// Private site is default, but overridable, setting
				public: -1,
			};

			const mergedParams = {
				...defaultParams,
				...providedParams,
				// Set to false because site validation should be a separate action
				validate: false,
			};

			return wpcomRequest( {
				path: '/sites/new',
				apiVersion: '1.1',
				method: 'post',
				body: mergedParams,
				token: authToken,
			} );
		},
	};
}
