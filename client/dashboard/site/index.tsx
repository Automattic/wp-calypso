import { __ } from '@wordpress/i18n';
import { useParams, useLoaderData } from 'react-router-dom';
import { type SiteObject } from '../data';
import PageLayout from '../page-layout';
import SiteMenu from '../site-menu';

function Site() {
	const { id } = useParams();
	const item = useLoaderData() as SiteObject;
	if ( item === undefined ) {
		return <p>{ __( 'No site found' ) }</p>;
	}

	return <PageLayout title={ item.title } subMenu={ <SiteMenu siteId={ id as string } /> } />;
}

export default Site;
