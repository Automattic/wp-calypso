import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getSiteOption } from 'calypso/state/sites/selectors';

interface ThemeSupports {
	[ index: string ]: boolean;
}

export type ActiveTheme = {
	is_block_theme: boolean;
	template: string;
	theme_supports: ThemeSupports;
	stylesheet: string;
};

export const useActiveThemeQuery = (
	siteId: number,
	isEnabled = false
): UseQueryResult< ActiveTheme[] > => {
	const themeSlug = useSelector( ( state ) => getSiteOption( state, siteId, 'theme_slug' ) );
	const queryKey = [ 'activeTheme', siteId, themeSlug ];

	return useQuery< ActiveTheme[] >( {
		queryKey,
		queryFn: () => {
			return wpcom.req.get( {
				path: `/sites/${ siteId }/themes?status=active`,
				apiNamespace: 'wp/v2',
			} );
		},
		enabled: isEnabled && !! siteId,
	} );
};
