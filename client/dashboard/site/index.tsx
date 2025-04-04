import { __ } from '@wordpress/i18n';
import { useLoaderData, Outlet } from 'react-router-dom';
import { type SiteData } from '../data';
import SiteMenu from '../site-menu';

function Site() {
	const siteData = useLoaderData() as SiteData;

	if ( siteData === undefined ) {
		return <p>{ __( 'No site found' ) }</p>;
	}

	return (
		<>
			<SiteMenu siteId={ siteData.ID } />
			<Outlet />
		</>
	);
}

export default Site;
