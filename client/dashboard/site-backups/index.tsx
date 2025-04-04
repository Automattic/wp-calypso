import { __ } from '@wordpress/i18n';
import { useParams } from 'react-router-dom';
import { findItemById } from '../data';
import PageLayout from '../page-layout';
import SiteMenu from '../site-menu';

export default function SiteBackups() {
	const { id } = useParams();
	const item = findItemById( id ?? '' );
	if ( item === undefined ) {
		return <p>{ __( 'No site found' ) }</p>;
	}

	return <PageLayout title={ __( 'Backups' ) } subMenu={ <SiteMenu siteId={ id as string } /> } />;
}
