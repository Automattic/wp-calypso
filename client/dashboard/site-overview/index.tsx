import { useRouteLoaderData } from 'react-router-dom';
import { type SiteObject } from '../data';
import PageLayout from '../page-layout';

function SiteOverview() {
	const item = useRouteLoaderData( 'site' ) as SiteObject;
	return <PageLayout title={ item.title } />;
}

export default SiteOverview;
