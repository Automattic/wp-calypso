import { useQuery, UseQueryResult } from 'react-query';
import wpcom from 'calypso/lib/wp';

interface ThemeSupports {
	[ index: string ]: boolean;
}

export type ActiveTheme = {
	theme_supports: ThemeSupports;
};

export const useActiveThemeQuery = (
	siteId: number,
	isEnabled = false
): UseQueryResult< ActiveTheme[] > => {
	const queryKey = [ 'activeTheme', siteId ];

	return useQuery< ActiveTheme[] >(
		queryKey,
		() => {
			return wpcom.req.get( {
				path: `/sites/${ siteId }/themes?status=active`,
				apiNamespace: 'wp/v2',
			} );
		},
		{ enabled: isEnabled && !! siteId }
	);
};
