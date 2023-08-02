import { useLocalizedPlugins } from 'calypso/my-sites/plugins/utils';
import { useSelector } from 'calypso/state';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function useGetCategoryUrl() {
	const siteId = useSelector( getSelectedSiteId ) as number;
	let domain = useSelector( ( state ) => getSiteDomain( state, siteId ) ) || '';
	domain = domain.replace( /\//, '::' );
	const { localizePath } = useLocalizedPlugins();

	return ( slug: string ): string => {
		if ( slug !== 'discover' ) {
			return localizePath( `/plugins/browse/${ slug }/${ domain }` );
		}

		return localizePath( `/plugins/${ domain }` );
	};
}
