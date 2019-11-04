/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import AsyncLoad from 'components/async-load';
import SectionExport from 'my-sites/exporter/section-export';

export function exportSite( context, next ) {
	context.primary = <SectionExport />;
	next();
}

export function guidedTransfer( context, next ) {
	context.primary = (
		<AsyncLoad require="my-sites/guided-transfer" hostSlug={ context.params.host_slug } />
	);
	next();
}
