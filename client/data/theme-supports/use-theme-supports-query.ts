import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export type ThemeSupports = {
	[ 'align-wide' ]: boolean;
	gutenberg: boolean;
	[ 'infinite-scroll' ]: boolean;
};

export const useThemeSupportsQuery = ( siteId: number ) => {
	const queryKey = [ 'themeSupports', siteId ];
	return useQuery< ThemeSupports >( queryKey, () => {
		return wpcom.req.get( {
			path: `/sites/${ siteId }/theme-support`,
			apiNamespace: 'wpcom/v2',
		} );
	} );
};
