import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export type GutenbergFSESettings = {
	is_core_fse_eligible: boolean;
};

export const useGutenbergFSESettingsQuery = ( siteId: string ) => {
	const queryKey = `${ siteId }:gutenbergFSESettings`;

	return useQuery< GutenbergFSESettings >( queryKey, () => {
		return wpcom.req.get( {
			path: `/sites/${ siteId }/gutenberg`,
			apiNamespace: 'wpcom/v4',
		} );
	} );
};
