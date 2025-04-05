import { useLoaderData, Outlet } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { type SiteObject } from '../data';
import HeaderBar from '../header-bar';
import SiteMenu from '../site-menu';

function Site() {
	const siteData = useLoaderData( { from: '/sites/$siteId' } ) as SiteObject;

	if ( siteData === undefined ) {
		return <p>{ __( 'No site found' ) }</p>;
	}

	return (
		<>
			<HeaderBar>
				<SiteMenu siteId={ siteData.id } />
			</HeaderBar>
			<Outlet />
		</>
	);
}

export default Site;
