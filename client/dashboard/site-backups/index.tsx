import { __ } from '@wordpress/i18n';
import { useParams } from 'react-router-dom';
import { findItemById } from '../data';
import SiteMenu from '../site-menu';

export default function SiteBackups() {
	const { id } = useParams();
	const item = findItemById( id );
	if ( item === undefined ) {
		return <p>{ __( 'No site found' ) }</p>;
	}

	return (
		<>
			<SiteMenu siteId={ id } />
			<div>
				<h1>Backups</h1>
				<p>This is the site backups page for { item.title }.</p>
			</div>
		</>
	);
}
