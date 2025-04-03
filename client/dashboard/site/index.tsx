import { __ } from '@wordpress/i18n';
import { useParams } from 'react-router-dom';
import { findItemById } from '../data';
import SiteMenu from '../site-menu';

export default function Site() {
	const { id } = useParams();
	const item = findItemById( id );
	if ( item === undefined ) {
		return <p>{ __( 'No site found' ) }</p>;
	}

	return (
		<>
			<SiteMenu siteId={ id as string } />
			<div>
				<h1>{ item.title } </h1>
			</div>
		</>
	);
}
