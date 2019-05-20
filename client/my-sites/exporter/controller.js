/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import AsyncLoad from 'components/async-load';

export function exportSite( context, next ) {
	context.primary = <AsyncLoad require="my-sites/exporter/section-export" />;
	next();
}
