import page from '@automattic/calypso-router';
import { decodeURIComponentIfValid } from 'calypso/lib/url';
import SectionImport from 'calypso/my-sites/importer/section-import';

export function importSite( context, next ) {
	const engine = context.query?.engine;
	const fromSite = decodeURIComponentIfValid( context.query?.[ 'from-site' ] );

	const afterStartImport = () => {
		let path = context.pathname;

		if ( fromSite ) {
			path += '?from-site=' + fromSite;
		}
		page.replace( path );
	};

	context.primary = (
		<SectionImport engine={ engine } fromSite={ fromSite } afterStartImport={ afterStartImport } />
	);
	next();
}
