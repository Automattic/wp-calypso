/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import AsyncLoad from 'calypso/components/async-load';
import SectionExport from 'calypso/my-sites/exporter/section-export';

export function exportSite( context, next ) {
	context.primary = <SectionExport />;
	next();
}

export function guidedTransfer( context, next ) {
	context.primary = (
		<AsyncLoad require="calypso/my-sites/guided-transfer" hostSlug={ context.params.host_slug } />
	);
	next();
}
