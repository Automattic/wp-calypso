import { __ } from '@wordpress/i18n';
import { useParams, useLoaderData } from 'react-router-dom';
import { type SiteObject } from '../data';
import SiteMenu from '../site-menu';

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

export default Site;
