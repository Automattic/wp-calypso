import { isEnabled } from '@automattic/calypso-config';
import {
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
	PLAN_PERSONAL_MONTHLY,
	PLAN_BLOGGER,
	PLAN_PREMIUM_2_YEARS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BLOGGER_2_YEARS,
	PLAN_PERSONAL_2_YEARS,
} from '@automattic/calypso-products';
import { filter, map, pick, sortBy } from 'lodash';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { decodeEntities, parseHtml } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { PREINSTALLED_PREMIUM_PLUGINS } from 'calypso/my-sites/plugins/constants';
import { sanitizeSectionContent } from './sanitize-section-content';

/**
 * @param  {number} siteId     Site Object
 * @param  {Object} log        Notice log Object
 * @returns {boolean} True if notice matches criteria
 */
function isSameSiteNotice( siteId, log ) {
	return siteId && log.siteId && parseInt( log.siteId ) === siteId;
}

/**
 * @param  {string} pluginId Plugin ID
 * @param  {Object} log      Notice log Object
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
 * @param  {number} siteId   Site Object
 * @param  {string} pluginId Plugin Id
 * @param  {Object} log      Notice log Object
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
		'documentation_url',
		'homepage',
		'icons',
		'id',
		'last_updated',
		'name',
		'network',
		'num_ratings',
		'org_slug',
		'plugin_url',
		'product_video',
		'rating',
		'ratings',
		'requirements',
		'sections',
		'setup_url',
		'slug',
		'software_slug',
		'support_URL',
		'software_slug',
		'tags',
		'tested',
		'update',
		'updating',
		'variations',
		'version',
		'wp_admin_settings_page_url',
		'saas_landing_page',
		'categories'
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
	if ( 'undefined' === typeof window ) {
		return null;
	}

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
	const sortedCompatibility = sortBy(
		Object.keys( compatibilityList ).map( splitInNumbers ),
		[ 0, 1, 2 ]
	);
	return sortedCompatibility.map( function ( version ) {
		if ( version.length && version[ version.length - 1 ] === 0 ) {
			version.pop();
		}
		return version.join( '.' );
	} );
}

export function mapStarRatingToPercent( starRating ) {
	return ( ( starRating ?? 0 ) / 5 ) * 100;
}

export function normalizePluginData( plugin, pluginData ) {
	plugin = getAllowedPluginData( { ...plugin, ...pluginData } );

	plugin.variations = getPreinstalledPremiumPluginsVariations( plugin );

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
					returnData.icon =
						item[ '256x256' ] ||
						item[ '128x128' ] ||
						item[ '2x' ] ||
						item[ '1x' ] ||
						item.svg ||
						item.default ||
						item;
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
 * @param {string} searchTerm The full plugin search query
 * @returns {Array<string | undefined>} The first item will be the search and the second will be the author if exists
 */
export function extractSearchInformation( searchTerm = '' ) {
	const author = searchTerm.match( DEVELOPER_PATTERN )?.[ 1 ];
	const search = searchTerm.replace( DEVELOPER_PATTERN, '' ).trim();

	return [ search, author ];
}

/**
 * Returns an author keyword to be used on plugin search by author
 * The follow actions are taken:
 * - Try to get the main author from the list of contributors
 * - Try to extract the author keyword from author_profile
 * - Try to get the author_name
 * - Send an empty string if none of the previous actions works
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
 * Get the author keyword from author_profile property
 * @param plugin
 * @returns {string|null} the author keyword
 */
export function getPluginAuthorProfileKeyword( plugin ) {
	if ( ! plugin?.author_profile?.startsWith( WPORG_PROFILE_URL ) ) {
		return null;
	}

	return plugin.author_profile.replace( WPORG_PROFILE_URL, '' ).replaceAll( '/', '' );
}

/**
 * @param currentPlan
 * @param pluginBillingPeriod
 * @returns the correct plan slug depending on current plan and pluginBillingPeriod
 */
export function marketplacePlanToAdd( currentPlan, pluginBillingPeriod ) {
	if ( isEnabled( 'marketplace-personal-premium' ) ) {
		// Site is free - doesn't have a plan.
		return pluginBillingPeriod === IntervalLength.ANNUALLY ? PLAN_PERSONAL : PLAN_PERSONAL_MONTHLY;
	}
	// Legacy plans always upgrade to business.
	switch ( currentPlan.product_slug ) {
		case PLAN_PERSONAL_2_YEARS:
		case PLAN_PREMIUM_2_YEARS:
		case PLAN_BLOGGER_2_YEARS:
			return PLAN_BUSINESS_2_YEARS;
		case PLAN_PERSONAL:
		case PLAN_PREMIUM:
		case PLAN_BLOGGER:
			return PLAN_BUSINESS;
		default:
			// Return annual plan if selected, monthly otherwise.
			return pluginBillingPeriod === IntervalLength.ANNUALLY
				? PLAN_BUSINESS
				: PLAN_BUSINESS_MONTHLY;
	}
}

/**
 * Determines the URL to use for managing a connection.
 * @param {string} siteSlug The site slug to use in the URL.
 * @returns The URL to use for managing a connection.
 */
export const getManageConnectionHref = ( siteSlug ) => {
	if ( isEnabled( 'untangling/hosting-menu' ) ) {
		return isJetpackCloud() || isA8CForAgencies()
			? `https://wordpress.com/sites/settings/administration/${ siteSlug }/manage-connection`
			: `/sites/settings/administration/${ siteSlug }/manage-connection`;
	}

	return isJetpackCloud() || isA8CForAgencies()
		? `https://wordpress.com/settings/manage-connection/${ siteSlug }`
		: `/settings/manage-connection/${ siteSlug }`;
};

/**
 * Some plugins can be preinstalled on WPCOM and available as standalone on WPORG,
 * but require a paid upgrade to function.
 * @typedef {Object} PluginVariations
 * @property {Object} monthly The plugin's monthly variation
 * @property {string} monthly.product_slug The plugin's monthly variation's product slug
 * @property {Object} yearly The plugin's yearly variation
 * @property {string} yearly.product_slug The plugin's yearly variation's product slug
 * @param {Object} plugin
 * @returns {PluginVariations}
 */
export function getPreinstalledPremiumPluginsVariations( plugin ) {
	if ( ! PREINSTALLED_PREMIUM_PLUGINS[ plugin.slug ] || !! plugin.variations ) {
		return plugin?.variations;
	}
	const { monthly, yearly } = PREINSTALLED_PREMIUM_PLUGINS[ plugin.slug ].products;
	return {
		monthly: { product_slug: monthly },
		yearly: { product_slug: yearly },
	};
}

/**
 * Returns the product slug of periodVariation passed filtering the productsList passed only if required
 * @param {{ product_slug?: string; product_id?: number } | undefined} periodVariation The variation object with the shape { product_slug: string; product_id: number; }
 * @param {Record<string, Object>} productsList The list of products
 * @returns The product slug if it exists in the periodVariation, if it does not exist in periodVariation
 * it will find the product slug in the productsList filtering by the variation.product_id.
 * It additionally returns:
 *  - null|undefined if periodVariation is null|undefined
 * - null|undefined if variation.product_id is null|undefined
 * - undefined product is not found by productId in productsList
 */
export function getProductSlugByPeriodVariation( periodVariation, productsList ) {
	if ( ! periodVariation ) {
		return periodVariation;
	}

	const productSlug = periodVariation.product_slug;
	if ( productSlug ) {
		return productSlug;
	}

	const productId = periodVariation.product_id;
	if ( productId === undefined || productId === null ) {
		return productId;
	}

	return Object.values( productsList ).find( ( product ) => product.product_id === productId )
		?.product_slug;
}

/**
 * @param  {Object} plugin The plugin object
 * @param  {boolean} isMarketplaceProduct Is this part of WP.com Marketplace or WP.org
 * @returns {string} The software slug string
 */
export const getSoftwareSlug = ( plugin, isMarketplaceProduct ) =>
	isMarketplaceProduct ? plugin.software_slug || plugin.org_slug : plugin.slug;

/**
 * @typedef {import('calypso/lib/purchases/types').Purchase} Purchase
 * @param  {Object} plugin The plugin object
 * @param  {Array} purchases An array of site purchases
 * @returns {Purchase} The purchase object, if found.
 */
export const getPluginPurchased = ( plugin, purchases ) => {
	return (
		plugin?.variations &&
		purchases.find( ( purchase ) =>
			Object.values( plugin.variations ).some(
				( variation ) => variation.product_id === purchase.productId
			)
		)
	);
};

/**
 * Gets the SaaS redirect URL of a plugin if it exits and is valid
 * @param {plugin} plugin The plugin object  to read the SaaS redirect url from
 * @param {number} userId The user id
 * @param {number} siteId The site id
 * @returns The URL of the SaaS redirect page or null if it doesn't exist or is an invalid URL
 */
export function getSaasRedirectUrl( plugin, userId, siteId ) {
	if ( ! plugin?.saas_landing_page ) {
		return null;
	}
	try {
		const saasRedirectUrl = new URL( plugin.saas_landing_page );
		saasRedirectUrl.searchParams.append( 'uuid', `${ userId }+${ siteId }` );
		return saasRedirectUrl.toString();
	} catch ( error ) {
		return null;
	}
}
