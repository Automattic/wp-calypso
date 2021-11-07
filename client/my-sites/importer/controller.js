import page from 'page';
import { decodeURIComponentIfValid } from 'calypso/lib/url';
import SectionImport from 'calypso/my-sites/importer/section-import';

export function importSite( context, next ) {
	const engine = context.query?.engine;
	const fromSite = decodeURIComponentIfValid( context.query?.[ 'from-site' ] );

	const afterStartImport = () => page.replace( context.pathname );

	context.primary = (
		<SectionImport engine={ engine } fromSite={ fromSite } afterStartImport={ afterStartImport } />
	);
	next();
}
