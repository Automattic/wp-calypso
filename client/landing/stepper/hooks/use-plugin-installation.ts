import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { DEFAULT_RETRY, Options } from './use-plugin-auto-installation';

interface APIError extends Error {
	error: string;
}

const installPlugin = async ( siteId: number, pluginSlug: string ) => {
	try {
		return await wpcom.req.post( {
			path: `/sites/${ siteId }/plugins/${ pluginSlug }/install?http_envelope=1`,
			apiNamespace: 'rest/v1.2',
			body: {},
		} );
	} catch ( error ) {
		if ( ( error as APIError ).error === 'plugin_already_installed' ) {
			return { status: 'success' };
		}
		return Promise.reject( error );
	}
};

export const usePluginInstallation = ( pluginSlug: string, siteId?: number, options?: Options ) => {
	return useMutation( {
		mutationKey: [ 'onboarding-site-plugin-installation', siteId, pluginSlug ],
		mutationFn: async () => installPlugin( siteId!, pluginSlug ),
		retry: options?.retry ?? DEFAULT_RETRY,
	} );
};
