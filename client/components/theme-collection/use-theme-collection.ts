import { useSelector } from 'calypso/state';
import { getThemesForQueryIgnoringPage } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

interface ThemesQuery {
	page: number;
	number: number;
	tier: string;
	filter: string;
	search: string;
	collection: string;
}

export function useThemeCollection( query: ThemesQuery ) {
	const siteId = useSelector( getSelectedSiteId ) as unknown as string | null;
	const themes = useSelector( ( state ) => getThemesForQueryIgnoringPage( state, 'wpcom', query ) );

	return { siteId, themes };
}
