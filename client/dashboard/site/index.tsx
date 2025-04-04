import { __ } from '@wordpress/i18n';
import { useParams, useLoaderData } from 'react-router-dom';
import { fetchSite } from '../data/index';
import SiteMenu from '../site-menu';
import type { LoaderFunction } from 'react-router-dom';

// Add type for the site data
interface SiteData {
	title: string;
	// Add other properties that your site data contains
}

function Site() {
	const { id } = useParams();
	// Specify the type for useLoaderData
	const item = useLoaderData() as SiteData;
	if ( item === undefined ) {
		return <p>{ __( 'No site found' ) }</p>;
	}

	return (
		<>
			<SiteMenu siteId={ id as string } />
			<div>
				<h1>{ item.title }</h1>
			</div>
		</>
	);
}

// Fix the loader type syntax
Site.loader = ( async ( { params } ) => {
	return fetchSite( params.id as string );
} ) satisfies LoaderFunction;

export default Site;
