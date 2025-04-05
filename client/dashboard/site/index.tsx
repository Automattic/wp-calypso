import { __ } from '@wordpress/i18n';
import { useLoaderData, Outlet } from 'react-router-dom';
import { type SiteData } from '../data';
import HeaderBar from '../header-bar';
import SiteMenu from '../site-menu';

function Site() {
	const siteData = useLoaderData() as SiteData;

	if ( siteData === undefined ) {
		return <p>{ __( 'No site found' ) }</p>;
	}

	return (
		<>
			<HeaderBar>
				<SiteMenu siteId={ siteData.ID } />
			</HeaderBar>
			<Outlet />
		</>
	);
}

export default Site;
