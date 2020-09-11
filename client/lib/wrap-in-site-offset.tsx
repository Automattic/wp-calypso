/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { SiteOffsetProvider } from 'components/site-offset/context';
import { Context } from './types';

export default function wrapInSiteOffsetProvider( context: Context, next: Function ) {
	context.primary = (
		<SiteOffsetProvider site={ context.params.site }>{ context.primary }</SiteOffsetProvider>
	);
	next();
}
