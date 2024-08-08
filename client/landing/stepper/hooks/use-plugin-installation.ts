import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { DEFAULT_RETRY, Options } from './use-plugin-auto-installation';

interface WPError {
	name: string;
}

const installPlugin = async ( siteId: number, pluginSlug: string ) => {
	try {
		const response = await wpcom.req.post(
			{
				path: `/sites/${ siteId }/plugins/${ pluginSlug }/install`,
			},
			{ apiVersion: '1.2', http_envelope: 1 },
			{}
		);
		return response;
	} catch ( error ) {
		if ( ( error as WPError ).name === 'PluginAlreadyInstalledError' ) {
			return 'success';
		}
		throw error;
	}
};

export const usePluginInstallation = ( pluginSlug: string, siteId?: number, options?: Options ) => {
	return useMutation( {
		mutationKey: [ 'onboarding-site-plugin-installation', siteId, pluginSlug ],
		mutationFn: async () => installPlugin( siteId!, pluginSlug ),
		retry: options?.retry ?? DEFAULT_RETRY,
	} );
};
