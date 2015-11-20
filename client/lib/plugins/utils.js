/**
 * External dependencies
 */
var _pick = require( 'lodash/object/pick' ),
	_assign = require( 'lodash/object/assign' ),
	_property = require( 'lodash/utility/property' ),
	_reject = require( 'lodash/collection/reject' ),
	_map = require( 'lodash/collection/map' ),
	filter = require( 'lodash/collection/filter' ),
	_transform = require( 'lodash/object/transform' ),
	_sortByAll = require( 'lodash/collection/sortByAll' ),
	sanitizeHtml = require( 'sanitize-html' );

/**
 * Internal dependencies
 */
var decodeEntities = require( 'lib/formatting' ).decodeEntities,
	parseHtml = require( 'lib/formatting' ).parseHtml,
	PluginUtils;

/**
 * @param  {Object} site       Site Object
 * @param  {Object} log        Notice log Object
 * @return {Bool} True if notice matches criteria
 */
function isSameSiteNotice( site, log ) {
	return site && log.site && log.site.ID === site.ID;
}

/**
 * @param  {String} pluginSlug Plugin Slug
 * @param  {Object} log        Notice log Object
 * @return {Bool} True if notice matches criteria
 */
function isSamePluginNotice( pluginSlug, log ) {
	return pluginSlug && log.plugin && log.plugin.slug === pluginSlug;
}

/**
 * Filter function that return notices that fit a certain criteria.
 *
 * @param  {Object} site       Site Object
 * @param  {String} pluginSlug Plugin Slug
 * @param  {Object} log        Notice log Object
 * @return {Bool} True if notice matches criteria
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

PluginUtils = {
	whiteListPluginData: function( plugin ) {
		return _pick( plugin,
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
			'wp_admin_settings_page_url',
			'wpcom'
		);
	},

	extractAuthorName: function( authorElementSource ) {
		if ( ! authorElementSource ) {
			return '';
		}
		return decodeEntities( authorElementSource.replace( /(<([^>]+)>)/ig, '' ) );
	},

	extractAuthorUrl: function( authorElementSource ) {
		var match = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/.exec( authorElementSource );
		return ( match && match[ 1 ] ? match[ 1 ] : '' );
	},

	extractScreenshots: function( screenshotsHtml ) {
		const screenshotsDom = parseHtml( screenshotsHtml );

		const list = screenshotsDom && screenshotsDom.querySelectorAll( 'li' );
		if ( ! list ) {
			return null;
		}
		let screenshots = _map( list, function( li ) {
			const img = li.querySelectorAll( 'img' );
			const captionP = li.querySelectorAll( 'p' );

			if ( img[ 0 ].src ) {
				return {
					url: img[ 0 ].src,
					caption: captionP[ 0 ] ? captionP[ 0 ].textContent : null
				};
			}
		} );

		screenshots = screenshots.filter( screenshot => screenshot );

		return screenshots.length ? screenshots : null;
	},

	normalizeCompatibilityList: function( compatibilityList ) {
		function splitInNumbers( version ) {
			let splittedVersion = version.split( '.' ).map( function( versionComponent ) {
				return Number.parseInt( versionComponent, 10 );
			} );
			while ( splittedVersion.length < 3 ) {
				splittedVersion.push( 0 );
			}
			return splittedVersion;
		}
		let sortedCompatibility = _sortByAll( Object.keys( compatibilityList ).map( splitInNumbers ), [ 0, 1, 2 ] );
		return sortedCompatibility.map( function( version ) {
			if ( version.length && version[ version.length - 1 ] === 0 ) {
				version.pop();
			}
			return version.join( '.' );
		} );
	},

	normalizePluginData: function( plugin, pluginData ) {
		plugin = this.whiteListPluginData( _assign( plugin, pluginData ) );

		return _transform( plugin, function( returnData, item, key ) {
			switch ( key ) {
				case 'short_description':
				case 'description':
				case 'name':
				case 'slug':
					returnData[ key ] = decodeEntities( item );
					break;
				case 'author':
					returnData.author = item;
					returnData.author_name = PluginUtils.extractAuthorName( item );
					returnData.author_url = plugin.author_url || PluginUtils.extractAuthorUrl( item );
					break;
				case 'sections':
					let cleanItem = {};
					for ( let sectionKey of Object.keys( item ) ) {
						cleanItem[ sectionKey] = sanitizeHtml( item[ sectionKey ], {
							allowedTags: [ 'h4', 'h5', 'h6', 'blockquote', 'code', 'b', 'i', 'em', 'strong', 'a', 'p', 'img', 'ul', 'ol', 'li' ],
							allowedAttributes: { a: [ 'href' ], img: [ 'src' ] },
							allowedSchemes: [ 'http', 'https' ],
							transformTags: {
								h1: 'h3',
								h2: 'h3',
							}
						} );
					}
					returnData.sections = cleanItem;
					returnData.screenshots = cleanItem.screenshots ? PluginUtils.extractScreenshots( cleanItem.screenshots ) : null;
					break;
				case 'num_ratings':
				case 'rating':
					returnData[ key ] = parseInt( item, 10 );
					break;
				case 'ratings':
					for ( let prop in item ) {
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
					returnData[ key ] = PluginUtils.normalizeCompatibilityList( item );
					break;
				default:
					returnData[ key ] = item;
			}
		} );
	},

	addWpcomIcon: function( plugin ) {
		if ( plugin.slug && plugin.wpcom ) {
			return _assign( {}, plugin, { icon: '/calypso/images/upgrades/plugins/' + plugin.slug + '.png' } );
		}

		return plugin;
	},
	/**
	 * In order to handle the case in All Sites in which a plugin with the same slug is available on both
	 * a Jetpack site and a .com site, this method ensures that the plugin appears twice in the plugins array,
	 * with/without the wpcom flag.
	 *
	 * @param {Array} plugins - List of plugins
	 * @returns {Array} - List of plugins
	 */
	duplicateHybridPlugins: function( plugins ) {
		return plugins.reduce( function( result, plugin ) {
			if ( ( plugin.wpcom && plugin.sites.some( _property( 'jetpack' ) ) ) ||
					( ! plugin.wpcom && ! plugin.sites.every( _property( 'jetpack' ) ) ) ) {
				// this is a plugin shared by .com and Jetpack sites, add it twice with different sites
				return result.concat(
					_assign( {}, plugin, {
						sites: filter( plugin.sites, _property( 'jetpack' ) ),
						wpcom: false
					} ),
					PluginUtils.addWpcomIcon( _assign( {}, plugin, {
						sites: _reject( plugin.sites, _property( 'jetpack' ) ),
						wpcom: true
					} ) )
				);
			}

			return result.concat( plugin );
		}, [] );
	},

	normalizePluginsList: function( pluginsList ) {
		if ( ! pluginsList ) {
			return [];
		}
		return pluginsList.map( function( pluginData ) {
			return PluginUtils.normalizePluginData( pluginData );
		} );
	},

	/**
	 * Return logs that match a certain critia.
	 *
	 * @param  {Array} logs        List of all notices
	 * @param  {Object} site       Site Object
	 * @param  {String} pluginSlug Plugin Slug
	 *
	 * @return {Array} Array of filtered logs that match the criteria
	 */
	filterNotices: function( logs, site, pluginSlug ) {
		return filter( logs, filterNoticesBy.bind( this, site, pluginSlug ) );
	}
};

module.exports = PluginUtils;
