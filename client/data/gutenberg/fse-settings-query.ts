import { useQuery, UseQueryResult } from 'react-query';
import wpcom from 'calypso/lib/wp';

export type GutenbergFSESettings = {
	is_core_fse_eligible: boolean;
};

export const useGutenbergFSESettingsQuery = (
	siteId: string
): UseQueryResult< GutenbergFSESettings > => {
	const queryKey = [ 'gutenbergFSESettings', siteId ];

	return useQuery< GutenbergFSESettings >( queryKey, () => {
		return wpcom.req.get( {
			path: `/sites/${ siteId }/gutenberg`,
			apiNamespace: 'wpcom/v4',
		} );
	} );
};
