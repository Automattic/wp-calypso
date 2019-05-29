/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import SectionExport from 'my-sites/exporter/section-export';

export function exportSite( context, next ) {
	context.primary = <SectionExport />;
	next();
}
