import { DefaultError, useMutation } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

interface ApiResponse {
	success: boolean;
}

const siteIsNotWordPress = ( siteSlug: string ): Promise< ApiResponse > => {
	return wpcomRequest( {
		path: `/sites/${ siteSlug }/automated-migration/site-is-not-wordpress`,
		apiNamespace: 'wpcom/v2',
		apiVersion: '2',
		method: 'POST',
	} );
};

export const useSiteNotWordPressMutation = ( siteSlug: string ) => {
	return useMutation< ApiResponse, DefaultError >( {
		mutationKey: [ 'site-is-not-wordpress', siteSlug ],
		mutationFn: () => siteIsNotWordPress( siteSlug ),
	} );
};
