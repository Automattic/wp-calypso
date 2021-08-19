import React from 'react';
import PodcastingDetails from 'calypso/my-sites/site-settings/podcasting-details';
import WritingMain from 'calypso/my-sites/site-settings/settings-writing/main';
import Taxonomies from 'calypso/my-sites/site-settings/taxonomies';

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
