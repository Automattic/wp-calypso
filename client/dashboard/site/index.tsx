import { __ } from '@wordpress/i18n';
import { useParams, useLoaderData } from 'react-router-dom';
import { fetchSite, type SiteObject } from '../data';
import SiteMenu from '../site-menu';
import type { LoaderFunction } from 'react-router-dom';

function Site() {
	const { id } = useParams();
	const item = useLoaderData() as SiteObject;
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

Site.loader = ( async ( { params } ) => {
	return fetchSite( params.id as string );
} ) satisfies LoaderFunction;

export default Site;
