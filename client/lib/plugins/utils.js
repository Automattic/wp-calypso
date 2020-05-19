/**
 * External dependencies
 */

import { assign, filter, map, pick, sortBy, transform } from 'lodash';

/**
 * Internal dependencies
 */
import { decodeEntities, parseHtml } from 'lib/formatting';
import { sanitizeSectionContent } from './sanitize-section-content';

/**
 * @param  {object} site       Site Object
 * @param  {object} log        Notice log Object
 * @returns {Bool} True if notice matches criteria
 */
function isSameSiteNotice( site, log ) {
	return site && log.site && log.site.ID === site.ID;
}

/**
 * @param  {string} pluginSlug Plugin Slug
 * @param  {object} log        Notice log Object
 * @returns {Bool} True if notice matches criteria
 */
function isSamePluginNotice( pluginSlug, log ) {
	return pluginSlug && log.plugin && log.plugin.slug === pluginSlug;
}

/**
 * Filter function that return notices that fit a certain criteria.
 *
 * @param  {object} site       Site Object
 * @param  {string} pluginSlug Plugin Slug
 * @param  {object} log        Notice log Object
 * @returns {Bool} True if notice matches criteria
 */
function filterNoticesBy( site, pluginSlug, log ) {
	if ( ! site && ! pluginSlug ) {
		return true;
	}
	if ( isSameSiteNotice( site, log ) && isSamePluginNotice( pluginSlug, log ) ) {
		return true;
	} else if ( ! pluginSlug && isSameSiteNotice( site, log ) ) {
		return true;
	} else if ( ! site && isSamePluginNotice( pluginSlug, log ) ) {
		return true;
	}
	return false;
}

export function whiteListPluginData( plugin ) {
	return pick(
		plugin,
		'action_links',
		'active',
		'author',
		'author_url',
		'autoupdate',
		'banners',
		'compatibility',
		'description',
		'short_description',
		'detailsFetched',
		'downloaded',
		'homepage',
		'icons',
		'id',
		'last_updated',
		'name',
		'network',
		'num_ratings',
		'plugin_url',
		'rating',
		'ratings',
		'sections',
		'slug',
		'support_URL',
		'update',
		'updating',
		'version',
		'wp_admin_settings_page_url'
	);
}

export function extractAuthorName( authorElementSource ) {
	if ( ! authorElementSource ) {
		return '';
	}
	return decodeEntities( authorElementSource.replace( /(<([^>]+)>)/gi, '' ) );
}

export function extractAuthorUrl( authorElementSource ) {
	const match = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/.exec( authorElementSource );
	return match && match[ 1 ] ? match[ 1 ] : '';
}

export function extractScreenshots( screenshotsHtml ) {
	const screenshotsDom = parseHtml( screenshotsHtml );

	const list = screenshotsDom && screenshotsDom.querySelectorAll( 'li' );
	if ( ! list ) {
		return null;
	}
	let screenshots = map( list, function ( li ) {
		const img = li.querySelectorAll( 'img' );
		const captionP = li.querySelectorAll( 'p' );

		if ( img[ 0 ] && img[ 0 ].src ) {
			return {
				url: img[ 0 ].src,
				caption: captionP[ 0 ] ? captionP[ 0 ].textContent : null,
			};
		}
	} );

	screenshots = screenshots.filter( ( screenshot ) => screenshot );

	return screenshots.length ? screenshots : null;
}

export function normalizeCompatibilityList( compatibilityList ) {
	function splitInNumbers( version ) {
		const splittedVersion = version.split( '.' ).map( function ( versionComponent ) {
			return Number.parseInt( versionComponent, 10 );
		} );
		while ( splittedVersion.length < 3 ) {
			splittedVersion.push( 0 );
		}
		return splittedVersion;
	}
	const sortedCompatibility = sortBy( Object.keys( compatibilityList ).map( splitInNumbers ), [
		0,
		1,
		2,
	] );
	return sortedCompatibility.map( function ( version ) {
		if ( version.length && version[ version.length - 1 ] === 0 ) {
			version.pop();
		}
		return version.join( '.' );
	} );
}

export function normalizePluginData( plugin, pluginData ) {
	plugin = whiteListPluginData( assign( plugin, pluginData ) );

	return transform( plugin, function ( returnData, item, key ) {
		switch ( key ) {
			case 'short_description':
			case 'description':
			case 'name':
			case 'slug':
				returnData[ key ] = decodeEntities( item );
				break;
			case 'author':
				returnData.author = item;
				returnData.author_name = extractAuthorName( item );
				returnData.author_url = plugin.author_url || extractAuthorUrl( item );
				break;
			case 'sections': {
				const cleanItem = {};
				for ( const sectionKey of Object.keys( item ) ) {
					if ( ! item[ sectionKey ] ) {
						throw new Error( `Section expected for key ${ sectionKey }` );
					}
					cleanItem[ sectionKey ] = sanitizeSectionContent( item[ sectionKey ] );
				}
				returnData.sections = cleanItem;
				returnData.screenshots = cleanItem.screenshots
					? extractScreenshots( cleanItem.screenshots )
					: null;
				break;
			}
			case 'num_ratings':
			case 'rating':
				returnData[ key ] = parseInt( item, 10 );
				break;
			case 'ratings':
				for ( const prop in item ) {
					item[ prop ] = parseInt( item[ prop ], 10 );
				}
				returnData[ key ] = item;
				break;
			case 'icons':
				if ( item ) {
					returnData.icon = item[ '2x' ] || item[ '1x' ] || item.svg || item.default;
				}
				break;
			case 'homepage':
			case 'plugin_url':
				returnData.plugin_url = item;
				break;
			case 'compatibility':
				returnData[ key ] = normalizeCompatibilityList( item );
				break;
			default:
				returnData[ key ] = item;
		}
	} );
}

export function normalizePluginsList( pluginsList ) {
	if ( ! pluginsList ) {
		return [];
	}
	return map( pluginsList, ( pluginData ) => normalizePluginData( pluginData ) );
}

/**
 * Return logs that match a certain critia.
 *
 * @param  {Array} logs        List of all notices
 * @param  {object} site       Site Object
 * @param  {string} pluginSlug Plugin Slug
 *
 * @returns {Array} Array of filtered logs that match the criteria
 */
export function filterNotices( logs, site, pluginSlug ) {
	return filter( logs, filterNoticesBy.bind( this, site, pluginSlug ) );
}
