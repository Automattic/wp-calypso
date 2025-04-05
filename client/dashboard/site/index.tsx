import { useLoaderData, Outlet } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { type FetchSiteRouteResponse } from '../data';
import HeaderBar from '../header-bar';
import SiteMenu from '../site-menu';

function Site() {
	const siteData = useLoaderData( { from: '/sites/$siteId' } ) as FetchSiteRouteResponse;

	if ( siteData === undefined ) {
		return <p>{ __( 'No site found' ) }</p>;
	}

	return (
		<>
			<HeaderBar>
				<SiteMenu siteId={ siteData.site.id } />
			</HeaderBar>
			<Outlet />
		</>
	);
}

export default Site;
