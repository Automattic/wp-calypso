/**
 * External dependencies
 */
import startsWith from 'lodash/startsWith';

/**
 * Internal dependencies
 */
import config from 'config';

export function isStatsdAnalyticsAllowed() {
	return config( 'boom_analytics_enabled' );
}

export function statsdUrl( path, eventType, duration, currentPath = undefined ) {
	let featureSlug = path === '/' ? 'homepage' : path.replace( /^\//, '' ).replace( /\.|\/|:/g, '_' );
	let matched;
	// prevent explosion of read list metrics
	// this is a hack - ultimately we want to report this URLs in a more generic way to
	// google analytics
	if ( startsWith( featureSlug, 'read_list' ) ) {
		featureSlug = 'read_list';
	} else if ( startsWith( featureSlug, 'tag_' ) ) {
		featureSlug = 'tag__id';
	} else if ( startsWith( featureSlug, 'domains_add_suggestion_' ) ) {
		featureSlug = 'domains_add_suggestion__suggestion__domain';
	} else if ( startsWith( currentPath, '/plugins/browse/' ) ) {
		featureSlug = 'plugins_browse__site';
	} else if ( featureSlug.match( /^plugins_[^_].*__/ ) ) {
		featureSlug = 'plugins__site__plugin';
	} else if ( featureSlug.match( /^plugins_[^_]/ ) ) {
		featureSlug = 'plugins__site__unknown'; // fail safe because there seems to be some URLs we're not catching
	} else if ( startsWith( featureSlug, 'read_post_feed_' ) ) {
		featureSlug = 'read_post_feed__id';
	} else if ( startsWith( featureSlug, 'read_post_id_' ) ) {
		featureSlug = 'read_post_id__id';
	} else if ( ( matched = featureSlug.match( /^start_(.*)_(..)$/ ) ) != null ) {
		featureSlug = `start_${ matched[ 1 ] }`;
	}

	const type = eventType.replace( '-', '_' );
	const json = JSON.stringify( {
		beacons: [
			`calypso.${ config( 'boom_analytics_key' ) }.${ featureSlug }.${ type }:${ duration }|ms`
		]
	} );

	const [ encodedPath, jsonData ] = [ path, json ].map( encodeURIComponent );
	return `https://pixel.wp.com/boom.gif?v=calypso&u=${ encodedPath }&json=${ jsonData }`;
}
