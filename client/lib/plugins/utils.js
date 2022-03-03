import { filter, map, pick, sortBy } from 'lodash';
import { decodeEntities, parseHtml } from 'calypso/lib/formatting';
import { sanitizeSectionContent } from './sanitize-section-content';

/**
 * @param  {number} siteId     Site Object
 * @param  {object} log        Notice log Object
 * @returns {boolean} True if notice matches criteria
 */
function isSameSiteNotice( siteId, log ) {
	return siteId && log.siteId && parseInt( log.siteId ) === siteId;
}

/**
 * @param  {string} pluginId Plugin ID
 * @param  {object} log      Notice log Object
 * @returns {boolean} True if notice matches criteria
 */
function isSamePluginNotice( pluginId, log ) {
	if ( ! pluginId || ! log.pluginId ) {
		return false;
	}

	return isSamePluginIdSlug( log.pluginId, pluginId );
}

/**
 * @param  {string} idOrSlug First plugin ID or slug for comparison
 * @param  {string} slugOrId Second plugin ID or slug for comparison
 * @returns {boolean} True if the plugin ID and slug match
 */
export function isSamePluginIdSlug( idOrSlug, slugOrId ) {
	const firstIdOrSlug = idOrSlug.toString();
	const secondIdOrSlug = slugOrId.toString();
	return (
		firstIdOrSlug === secondIdOrSlug ||
		firstIdOrSlug.startsWith( secondIdOrSlug + '/' ) ||
		firstIdOrSlug.endsWith( '/' + secondIdOrSlug ) ||
		secondIdOrSlug.startsWith( firstIdOrSlug + '/' ) ||
		secondIdOrSlug.endsWith( '/' + firstIdOrSlug )
	);
}

/**
 * Filter function that return notices that fit a certain criteria.
 *
 * @param  {number} siteId   Site Object
 * @param  {string} pluginId Plugin Id
 * @param  {object} log      Notice log Object
 * @returns {boolean} True if notice matches criteria
 */
function filterNoticesBy( siteId, pluginId, log ) {
	if ( ! siteId && ! pluginId ) {
		return true;
	}
	if ( isSameSiteNotice( siteId, log ) && isSamePluginNotice( pluginId, log ) ) {
		return true;
	} else if ( ! pluginId && isSameSiteNotice( siteId, log ) ) {
		return true;
	} else if ( ! siteId && isSamePluginNotice( pluginId, log ) ) {
		return true;
	}
	return false;
}

export function getAllowedPluginData( plugin ) {
	return pick(
		plugin,
		'action_links',
		'active',
		'author',
		'author_profile',
		'author_url',
		'autoupdate',
		'banners',
		'compatibility',
		'contributors',
		'description',
		'active_installs',
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
		'product_video',
		'rating',
		'ratings',
		'requirements',
		'sections',
		'setup_url',
		'slug',
		'support_URL',
		'tags',
		'tested',
		'update',
		'updating',
		'variations',
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
	plugin = getAllowedPluginData( { ...plugin, ...pluginData } );

	return Object.entries( plugin ).reduce( ( returnData, [ key, item ] ) => {
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
						// The current section hasn't value or is empty.
						continue;
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
			case 'product_video':
				returnData.banner_video_src = item;
				break;
			default:
				returnData[ key ] = item;
		}

		return returnData;
	}, {} );
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
 * @param  {Array} logs      List of all notices
 * @param  {number} siteId   Site Object
 * @param  {string} pluginId Plugin ID
 * @returns {Array} Array of filtered logs that match the criteria
 */
export function filterNotices( logs, siteId, pluginId ) {
	return filter( logs, filterNoticesBy.bind( this, siteId, pluginId ) );
}

/**
 * Regex to extract the author from the search
 */
export const DEVELOPER_PATTERN = /developer:(?:\s)*"(.*)"/;

/**
 * Extract author and search params from the plugin search query
 *
 * @param {string} searchTerm The full plugin search query
 * @returns {Array<string|null>} The first item will be the search and the second will be the author if exists
 */
export function extractSearchInformation( searchTerm = '' ) {
	const author = searchTerm.match( DEVELOPER_PATTERN )?.[ 1 ] || null;
	const search = searchTerm.replace( DEVELOPER_PATTERN, '' ).trim();

	return [ search, author ];
}

/**
 * Returns an author keyword to be used on plugin search by author
 * The follow actions are taken:
 * * Try to get the main author from the list of contributors
 * * Try to extract the author keyword from author_profile
 * * Try to get the author_name
 * * Send an empty string if none of the previous actions works
 *
 * @param plugin
 * @returns {string} the author keyword or an empty string
 */
export function getPluginAuthorKeyword( plugin ) {
	const { contributors = {} } = plugin;

	return (
		Object.keys( contributors ).find( ( contributorKey ) => {
			const authorName = plugin.author_name;
			const contributorName = contributors[ contributorKey ].display_name;

			return (
				authorName &&
				contributorName &&
				( authorName.includes( contributorName ) || contributorName.includes( authorName ) )
			);
		} ) ||
		getPluginAuthorProfileKeyword( plugin ) ||
		plugin.author_name ||
		''
	);
}

export const WPORG_PROFILE_URL = 'https://profiles.wordpress.org/';

/**
 * Get the author keywrod from author_profile property
 *
 * @param plugin
 * @returns {string|null} the author keyword
 */
export function getPluginAuthorProfileKeyword( plugin ) {
	if ( ! plugin?.author_profile?.startsWith( WPORG_PROFILE_URL ) ) {
		return null;
	}

	return plugin.author_profile.replace( WPORG_PROFILE_URL, '' ).replaceAll( '/', '' );
}
