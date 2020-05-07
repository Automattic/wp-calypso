/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { SiteOffsetProvider } from 'landing/jetpack-cloud/components/site-offset/context';

export default function wrapInSiteOffsetProvider( context, next ) {
	context.primary = (
		<SiteOffsetProvider site={ context.params.site }>{ context.primary }</SiteOffsetProvider>
	);
	next();
}
