import { fetchSiteThemesActive } from '../../data/site-themes';
import type { Theme } from '../../data/site-themes';

export const siteThemesActiveQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'themes', 'active' ],
	queryFn: () => fetchSiteThemesActive( siteId ),
} );

export const isFSEActiveQuery = ( siteId: number ) => ( {
	...siteThemesActiveQuery( siteId ),
	select: ( themes: Theme[] ) => {
		return themes[ 0 ]?.is_block_theme ?? false;
	},
} );
