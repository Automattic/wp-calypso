import { useRouteLoaderData } from 'react-router-dom';
import { type SiteData } from '../data';
import PageLayout from '../page-layout';

function SiteOverview() {
	const item = useRouteLoaderData( 'site' ) as SiteData;
	return <PageLayout title={ item.name } />;
}

export default SiteOverview;
