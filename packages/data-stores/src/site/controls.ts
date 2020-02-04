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
                token: authToken || undefined,
                body: mergedParams,
            } );
        },
	};
}
