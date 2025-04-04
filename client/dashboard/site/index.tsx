import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useLoaderData, Outlet } from 'react-router-dom';
import { type SiteData } from '../data';
import SiteMenu from '../site-menu';

function Site() {
	const siteData = useLoaderData() as SiteData;
	const [ data, setData ] = useState< SiteData | undefined >();

	useEffect( () => {
		if ( siteData ) {
			setData( siteData );
		}
	}, [ siteData ] );

	if ( data === undefined ) {
		return <p>{ __( 'No site found' ) }</p>;
	}

	return (
		<>
			<SiteMenu siteId={ data.ID } />
			<Outlet />
		</>
	);
}

export default Site;
