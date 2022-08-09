import { useSelector } from 'react-redux';
import { useLocalizedPlugins } from 'calypso/my-sites/plugins/utils';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function useGetCategoryUrl() {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) ) || '';
	const { localizePath } = useLocalizedPlugins();

	return ( slug: string ): string => {
		if ( slug !== 'discover' ) {
			return localizePath( `/plugins/browse/${ slug }/${ domain }` );
		}

		return localizePath( `/plugins/${ domain }` );
	};
}
