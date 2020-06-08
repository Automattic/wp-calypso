/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { SiteOffsetProvider } from 'components/jetpack-cloud/site-offset/context';

export default function wrapInSiteOffsetProvider( context, next ) {
	context.primary = (
		<SiteOffsetProvider site={ context.params.site }>{ context.primary }</SiteOffsetProvider>
	);
	next();
}
