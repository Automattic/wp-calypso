/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import SectionImport from 'calypso/my-sites/importer/section-import';
import { decodeURIComponentIfValid } from 'calypso/lib/url';

export function importSite( context, next ) {
	const engine = context.query?.engine;
	const fromSite = decodeURIComponentIfValid( context.query?.[ 'from-site' ] );

	const afterStartImport = () => page.replace( context.pathname );

	context.primary = (
		<SectionImport engine={ engine } fromSite={ fromSite } afterStartImport={ afterStartImport } />
	);
	next();
}
