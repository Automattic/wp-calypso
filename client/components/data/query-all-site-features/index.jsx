import { useSelector } from 'react-redux';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import getSites from 'calypso/state/selectors/get-sites';

export default function QueryAllSiteFeatures() {
	const sites = useSelector( getSites );
	const allSiteIds = sites.map( ( site ) => site.ID );
	return <QuerySiteFeatures siteIds={ allSiteIds } />;
}
