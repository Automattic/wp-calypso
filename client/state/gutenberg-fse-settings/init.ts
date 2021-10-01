import { useQuery, UseQueryResult } from 'react-query';
import wpcom from 'calypso/lib/wp';

export const makeQueryKey = ( siteId: string ): string[] => [ 'gutenbergFSESettings', siteId ];

export type SuccessResponse< T > = {
	body: T;
	headers: Record< string, string >;
	status: 200 | 204;
};

export type GutenbergFSESettings = {
	is_core_fse_eligible: boolean;
};

export const useGutenbergFSESettings = (
	siteId: string
): UseQueryResult< GutenbergFSESettings, unknown > => {
	const queryKey = makeQueryKey( siteId );

	return useQuery< SuccessResponse< GutenbergFSESettings >, unknown, GutenbergFSESettings >(
		queryKey,
		() =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/gutenberg`,
				apiNamespace: 'wpcom/v4',
			} ),
		{
			select( data ) {
				return data.body;
			},
		}
	);
};
