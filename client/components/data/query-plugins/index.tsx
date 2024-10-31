import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import QueryAllJetpackSitesPlugins, {
	QueryBatchJetpackSitesPlugins,
} from '../query-all-jetpack-sites-plugins';
import QueryJetpackPlugins from '../query-jetpack-plugins';

export default function QueryPlugins( {
	siteId,
	inBatches = false,
}: {
	siteId?: number;
	inBatches?: boolean;
} ) {
	const isLoggedIn = useSelector( isUserLoggedIn );

	// Sites plugins can only be retrieved by logged in users
	if ( isLoggedIn === false ) {
		return false;
	}

	if ( inBatches ) {
		return <QueryBatchJetpackSitesPlugins />;
	}

	return siteId ? <QueryJetpackPlugins siteIds={ [ siteId ] } /> : <QueryAllJetpackSitesPlugins />;
}
