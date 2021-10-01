import React from 'react';
import SiteBlockListComponent from 'calypso/me/site-blocks/main';

export function siteBlockList( context, next ) {
	context.primary = React.createElement( SiteBlockListComponent );
	next();
}
