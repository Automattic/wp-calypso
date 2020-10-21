/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import WritingMain from 'calypso/my-sites/site-settings/settings-writing/main';
import Taxonomies from 'calypso/my-sites/site-settings/taxonomies';
import PodcastingDetails from 'calypso/my-sites/site-settings/podcasting-details';

export function writing( context, next ) {
	context.primary = React.createElement( WritingMain );
	next();
}

export function taxonomies( context, next ) {
	context.primary = React.createElement( Taxonomies, {
		taxonomy: context.params.taxonomy,
		postType: 'post',
	} );
	next();
}

export function podcasting( context, next ) {
	context.primary = React.createElement( PodcastingDetails );
	next();
}
