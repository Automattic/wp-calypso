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
import { pick, sortBy } from '@automattic/js-utils';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { decodeEntities, parseHtml } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { PREINSTALLED_PREMIUM_PLUGINS } from 'calypso/my-sites/plugins/constants';
import { sanitizeSectionContent } from './sanitize-section-content';
import type { Purchase } from '@automattic/api-core';
import type { PluginPeriodVariations } from 'calypso/data/marketplace/types';

// Plugin payloads from the WordPress.org, WordPress.com and ES endpoints are not validated.
type PluginData = Record< string, unknown >;

function isRecord( value: unknown ): value is Record< string, unknown > {
	return typeof value === 'object' && value !== null;
}

type NoticeLog = {
	siteId?: number | string;
	pluginId?: string;
};

type PeriodVariation = { product_slug?: string; product_id?: number };

type PluginSlugs = { slug: string; software_slug?: string; org_slug?: string };

type PluginWithVariations = { slug?: string; variations?: PluginPeriodVariations };

/**
 * @param  siteId Site ID
 * @param  log    Notice log Object
 * @returns True if notice matches criteria
 */
function isSameSiteNotice( siteId: number | undefined, log: NoticeLog ): boolean {
	return Boolean( siteId && log.siteId && parseInt( String( log.siteId ) ) === siteId );
}

/**
 * @param  pluginId Plugin ID
 * @param  log      Notice log Object
 * @returns True if notice matches criteria
 */
function isSamePluginNotice( pluginId: string | undefined, log: NoticeLog ): boolean {
	if ( ! pluginId || ! log.pluginId ) {
		return false;
	}

	return isSamePluginIdSlug( log.pluginId, pluginId );
}

/**
 * @param  idOrSlug First plugin ID or slug for comparison
 * @param  slugOrId Second plugin ID or slug for comparison
 * @returns True if the plugin ID and slug match
 */
export function isSamePluginIdSlug(
	idOrSlug: string | number,
	slugOrId: string | number
): boolean {
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
 * @param  siteId   Site ID
 * @param  pluginId Plugin Id
 * @param  log      Notice log Object
 * @returns True if notice matches criteria
 */
function filterNoticesBy(
	siteId: number | undefined,
	pluginId: string | undefined,
	log: NoticeLog
): boolean {
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

export function getAllowedPluginData( plugin: PluginData ): PluginData {
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
		'is_retired',
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

export function extractAuthorName( authorElementSource: string | undefined ): string {
	if ( ! authorElementSource ) {
		return '';
	}
	return decodeEntities( authorElementSource.replace( /(<([^>]+)>)/gi, '' ) );
}

export function extractAuthorUrl( authorElementSource: string ): string {
	const match = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/.exec( authorElementSource );
	return match && match[ 1 ] ? match[ 1 ] : '';
}

type Screenshot = { url: string; caption: string | null };

export function extractScreenshots( screenshotsHtml: string ): Screenshot[] | null {
	if ( 'undefined' === typeof window ) {
		return null;
	}

	const screenshotsDom = parseHtml( screenshotsHtml );

	const list: NodeListOf< HTMLLIElement > | undefined =
		screenshotsDom && screenshotsDom.querySelectorAll( 'li' );
	if ( ! list ) {
		return null;
	}
	const screenshots = Array.from( list ).map( function ( li ) {
		const img = li.querySelectorAll( 'img' );
		const captionP = li.querySelectorAll( 'p' );

		if ( img[ 0 ] && img[ 0 ].src ) {
			return {
				url: img[ 0 ].src,
				caption: captionP[ 0 ] ? captionP[ 0 ].textContent : null,
			};
		}
	} );

	const foundScreenshots = screenshots.filter(
		( screenshot ): screenshot is Screenshot => !! screenshot
	);

	return foundScreenshots.length ? foundScreenshots : null;
}

export function normalizeCompatibilityList(
	compatibilityList: Record< string, unknown >
): string[] {
	function splitInNumbers( version: string ): number[] {
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

export function mapStarRatingToPercent( starRating: number | null | undefined ): number {
	return ( ( starRating ?? 0 ) / 5 ) * 100;
}

export function normalizePluginData( plugin: PluginData, pluginData?: PluginData ): PluginData {
	plugin = getAllowedPluginData( { ...plugin, ...pluginData } );

	plugin.variations = getPreinstalledPremiumPluginsVariations( plugin as PluginWithVariations );

	return Object.entries( plugin ).reduce< PluginData >( ( returnData, [ key, item ] ) => {
		switch ( key ) {
			case 'short_description':
			case 'description':
			case 'name':
			case 'slug':
				returnData[ key ] = typeof item === 'string' ? decodeEntities( item ) : item;
				break;
			case 'author':
				returnData.author = item;
				returnData.author_name = typeof item === 'string' ? extractAuthorName( item ) : '';
				returnData.author_url = plugin.author_url || extractAuthorUrl( String( item ) );
				break;
			case 'sections': {
				const sections = isRecord( item ) ? item : {};
				const cleanItem: Record< string, string > = {};
				for ( const sectionKey of Object.keys( sections ) ) {
					const section = sections[ sectionKey ];
					if ( ! section ) {
						// The current section hasn't value or is empty.
						continue;
					}
					cleanItem[ sectionKey ] = sanitizeSectionContent( String( section ) );
				}
				returnData.sections = cleanItem;
				returnData.screenshots = cleanItem.screenshots
					? extractScreenshots( cleanItem.screenshots )
					: null;
				break;
			}
			case 'num_ratings':
			case 'rating':
				returnData[ key ] = parseInt( String( item ), 10 );
				break;
			case 'ratings':
				if ( isRecord( item ) ) {
					for ( const prop in item ) {
						item[ prop ] = parseInt( String( item[ prop ] ), 10 );
					}
				}
				returnData[ key ] = item;
				break;
			case 'icons':
				if ( isRecord( item ) ) {
					returnData.icon =
						item[ '256x256' ] ||
						item[ '128x128' ] ||
						item[ '2x' ] ||
						item[ '1x' ] ||
						item.svg ||
						item.default ||
						item;
				} else if ( item ) {
					returnData.icon = item;
				}
				break;
			case 'homepage':
			case 'plugin_url':
				returnData.plugin_url = item;
				break;
			case 'compatibility':
				returnData[ key ] = isRecord( item ) ? normalizeCompatibilityList( item ) : [];
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

export function normalizePluginsList(
	pluginsList: Record< string, PluginData > | PluginData[] | null | undefined
): PluginData[] {
	if ( ! pluginsList ) {
		return [];
	}
	return Object.values( pluginsList ).map( ( pluginData ) => normalizePluginData( pluginData ) );
}

/**
 * Return logs that match a certain critia.
 * @param  logs     List of all notices
 * @param  siteId   Site ID
 * @param  pluginId Plugin ID
 * @returns Array of filtered logs that match the criteria
 */
export function filterNotices< T extends NoticeLog >(
	logs: T[] | null | undefined,
	siteId?: number,
	pluginId?: string
): T[] {
	return ( logs ?? [] ).filter( ( log ) => filterNoticesBy( siteId, pluginId, log ) );
}

/**
 * Regex to extract the author from the search
 */
export const DEVELOPER_PATTERN = /developer:(?:\s)*"(.*)"/;

/**
 * Extract author and search params from the plugin search query
 * @param searchTerm The full plugin search query
 * @returns The first item will be the search and the second will be the author if exists
 */
export function extractSearchInformation(
	searchTerm = ''
): [ search: string, author: string | undefined ] {
	const author = searchTerm.match( DEVELOPER_PATTERN )?.[ 1 ];
	const search = searchTerm.replace( DEVELOPER_PATTERN, '' ).trim();

	return [ search, author ];
}

export const WPORG_PROFILE_URL = 'https://profiles.wordpress.org/';

/**
 * Get the author keyword from author_profile property
 * @param plugin
 * @returns the author keyword
 */
export function getPluginAuthorProfileKeyword(
	plugin: { author_profile?: string } | null | undefined
): string | null {
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
export function marketplacePlanToAdd(
	currentPlan: Pick< PeriodVariation, 'product_slug' >,
	pluginBillingPeriod: IntervalLength
): string {
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
 * @param siteSlug The site slug to use in the URL.
 * @returns The URL to use for managing a connection.
 */
export const getManageConnectionHref = ( siteSlug: string | null | undefined ): string => {
	return isJetpackCloud() || isA8CForAgencies()
		? `https://wordpress.com/settings/manage-connection/${ siteSlug }`
		: `/settings/manage-connection/${ siteSlug }`;
};

/**
 * Some plugins can be preinstalled on WPCOM and available as standalone on WPORG,
 * but require a paid upgrade to function.
 * @param plugin
 * @returns The plugin's own variations, or the preinstalled premium plugin's product slugs.
 */
export function getPreinstalledPremiumPluginsVariations(
	plugin: PluginWithVariations
): PluginPeriodVariations | undefined {
	const preinstalledPremiumPlugin = plugin.slug
		? PREINSTALLED_PREMIUM_PLUGINS[ plugin.slug as keyof typeof PREINSTALLED_PREMIUM_PLUGINS ]
		: undefined;
	if ( ! preinstalledPremiumPlugin || !! plugin.variations ) {
		return plugin?.variations;
	}
	const { monthly, yearly } = preinstalledPremiumPlugin.products;
	return {
		monthly: { product_slug: monthly },
		yearly: { product_slug: yearly },
	};
}

/**
 * Returns the product slug of periodVariation passed filtering the productsList passed only if required
 * @param periodVariation The variation object with the shape { product_slug: string; product_id: number; }
 * @param productsList The list of products
 * @returns The product slug if it exists in the periodVariation, if it does not exist in periodVariation
 * it will find the product slug in the productsList filtering by the variation.product_id.
 * It additionally returns:
 *  - null|undefined if periodVariation is null|undefined
 * - null|undefined if variation.product_id is null|undefined
 * - undefined product is not found by productId in productsList
 */
export function getProductSlugByPeriodVariation(
	periodVariation: PeriodVariation | null | undefined,
	productsList: Record< string, { product_id?: number; product_slug?: string } >
): string | null | undefined {
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
 * @param  plugin The plugin object
 * @param  isMarketplaceProduct Is this part of WP.com Marketplace or WP.org
 * @returns The software slug string
 */
export const getSoftwareSlug = (
	plugin: PluginSlugs,
	isMarketplaceProduct: boolean
): string | undefined =>
	isMarketplaceProduct ? plugin.software_slug || plugin.org_slug : plugin.slug;

/**
 * @param  plugin The plugin object
 * @param  purchases An array of site purchases
 * @returns The purchase object, if found.
 */
export const getPluginPurchased = (
	plugin: { variations?: PluginPeriodVariations } | null | undefined,
	purchases: Purchase[]
): Purchase | undefined => {
	const variations = plugin?.variations;
	if ( ! variations ) {
		return undefined;
	}
	return purchases.find( ( purchase ) =>
		Object.values( variations ).some(
			( variation ) => variation.product_id === purchase.product_id
		)
	);
};

/**
 * Gets the SaaS redirect URL of a plugin if it exits and is valid
 * @param plugin The plugin object  to read the SaaS redirect url from
 * @param userId The user id
 * @param siteId The site id
 * @returns The URL of the SaaS redirect page or null if it doesn't exist or is an invalid URL
 */
export function getSaasRedirectUrl(
	plugin: { saas_landing_page?: string } | null | undefined,
	userId: number | null | undefined,
	siteId: number | null | undefined
): string | null {
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
