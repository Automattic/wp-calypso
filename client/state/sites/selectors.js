/** @format */

/**
 * External dependencies
 */

import {
	compact,
	every,
	filter,
	find,
	flowRight as compose,
	get,
	has,
	map,
	partialRight,
	some,
	split,
	includes,
	startsWith,
} from 'lodash';
import i18n from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal dependencies
 */
import config from 'config';
import { isHttps, withoutHttp, addQueryArgs, urlToSlug } from 'lib/url';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { fromApi as seoTitleFromApi } from 'components/seo/meta-title-editor/mappings';
import versionCompare from 'lib/version-compare';
import { getCustomizerFocus } from 'my-sites/customize/panels';
import { getSiteComputedAttributes } from './utils';
import { isSiteUpgradeable, getSiteOptions, getSitesItems } from 'state/selectors';

/**
 * Returns a raw site object by its ID.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?Object}        Site object
 */
export const getRawSite = ( state, siteId ) => {
	return getSitesItems( state )[ siteId ] || null;
};

/**
 * Returns a site object by its slug.
 *
 * @param  {Object}  state     Global state tree
 * @param  {String}  siteSlug  Site URL
 * @return {?Object}           Site object
 */
export const getSiteBySlug = createSelector(
	( state, siteSlug ) =>
		find( getSitesItems( state ), site => getSiteSlug( state, site.ID ) === siteSlug ) || null,
	getSitesItems
);

/**
 * Memoization cache for the `getSite` selector
 */
let getSiteCache = new WeakMap();

/**
 * Returns a normalized site object by its ID or site slug.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number|String}  siteIdOrSlug Site ID or site slug
 * @return {?Object}        Site object
 */
export function getSite( state, siteIdOrSlug ) {
	const rawSite = getRawSite( state, siteIdOrSlug ) || getSiteBySlug( state, siteIdOrSlug );
	if ( ! rawSite ) {
		return null;
	}

	// Use the rawSite object itself as a WeakMap key
	const cachedSite = getSiteCache.get( rawSite );
	if ( cachedSite ) {
		return cachedSite;
	}

	const site = {
		...rawSite,
		...getSiteComputedAttributes( state, rawSite.ID ),
		...getJetpackComputedAttributes( state, rawSite.ID ),
	};

	// Once the `rawSite` object becomes outdated, i.e., state gets updated with a newer version
	// and no more references are held, the key will be automatically removed from the WeakMap.
	getSiteCache.set( rawSite, site );
	return site;
}

getSite.clearCache = () => {
	getSiteCache = new WeakMap();
};

export function getJetpackComputedAttributes( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return {};
	}
	return {
		hasMinimumJetpackVersion: siteHasMinimumJetpackVersion( state, siteId ),
		canAutoupdateFiles: canJetpackSiteAutoUpdateFiles( state, siteId ),
		canUpdateFiles: canJetpackSiteUpdateFiles( state, siteId ),
		canManage: canJetpackSiteManage( state, siteId ),
		isMainNetworkSite: isJetpackSiteMainNetworkSite( state, siteId ),
		isSecondaryNetworkSite: isJetpackSiteSecondaryNetworkSite( state, siteId ),
		isSiteUpgradeable: isSiteUpgradeable( state, siteId ),
	};
}

/**
 * Returns a filtered array of WordPress.com site IDs where a Jetpack site
 * exists in the set of sites with the same URL.
 *
 * @param  {Object}   state Global state tree
 * @return {Number[]}       WordPress.com site IDs with collisions
 */
export const getSiteCollisions = createSelector(
	state =>
		map(
			filter( getSitesItems( state ), wpcomSite => {
				const wpcomSiteUrlSansProtocol = withoutHttp( wpcomSite.URL );
				return (
					! wpcomSite.jetpack &&
					some(
						getSitesItems( state ),
						jetpackSite =>
							jetpackSite.jetpack && wpcomSiteUrlSansProtocol === withoutHttp( jetpackSite.URL )
					)
				);
			} ),
			'ID'
		),
	getSitesItems
);

/**
 * Returns true if a collision exists for the specified WordPress.com site ID.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether collision exists
 */
export function isSiteConflicting( state, siteId ) {
	return includes( getSiteCollisions( state ), siteId );
}

/**
 * Returns true if site has only a single user, false if the site not a single
 * user site, or null if the site is unknown.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?Boolean}        Whether site is a single user site
 */
export function isSingleUserSite( state, siteId ) {
	return get( getSite( state, siteId ), 'single_user_site', null );
}

/**
 * Returns true if site is a Jetpack site, false if the site is hosted on
 * WordPress.com, or null if the site is unknown.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?Boolean}        Whether site is a Jetpack site
 */
export function isJetpackSite( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	return site.jetpack;
}

/**
 * Returns true if the site is a Jetpack site with the specified module active,
 * or false if the module is not active. Returns null if the site is not known
 * or is not a Jetpack site.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @param  {String}   slug   Module slug
 * @return {?Boolean}        Whether site has Jetpack module active
 */
export function isJetpackModuleActive( state, siteId, slug ) {
	const modules = getSiteOption( state, siteId, 'active_modules' );
	if ( ! modules ) {
		return null;
	}

	return includes( modules, slug );
}

/**
 * Returns true if the Jetpack site is running a version meeting the specified
 * minimum, or false if the Jetpack site is running an older version. Returns
 * null if the version cannot be determined or if not a Jetpack site.
 *
 * @param  {Object}   state   Global state tree
 * @param  {Number}   siteId  Site ID
 * @param  {String}   version Minimum version
 * @return {?Boolean}         Whether running minimum version
 */
export function isJetpackMinimumVersion( state, siteId, version ) {
	const isJetpack = isJetpackSite( state, siteId );
	if ( ! isJetpack ) {
		return null;
	}

	const siteVersion = getSiteOption( state, siteId, 'jetpack_version' );
	if ( ! siteVersion ) {
		return null;
	}

	return versionCompare( siteVersion, version, '>=' );
}

/**
 * Returns the slug for a site, or null if the site is unknown.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?String}        Site slug
 */
export const getSiteSlug = createSelector(
	( state, siteId ) => {
		const site = getRawSite( state, siteId );
		if ( ! site ) {
			return null;
		}

		if ( getSiteOption( state, siteId, 'is_redirect' ) || isSiteConflicting( state, siteId ) ) {
			return withoutHttp( getSiteOption( state, siteId, 'unmapped_url' ) );
		}

		return urlToSlug( site.URL );
	},
	[ getSitesItems ]
);

/**
 * Returns the domain for a site, or null if the site is unknown.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?String}        Site domain
 */
export function getSiteDomain( state, siteId ) {
	if ( getSiteOption( state, siteId, 'is_redirect' ) || isSiteConflicting( state, siteId ) ) {
		return getSiteSlug( state, siteId );
	}

	const site = getRawSite( state, siteId );

	if ( ! site ) {
		return null;
	}

	return withoutHttp( site.URL );
}

/**
 * Returns a title by which the site can be canonically referenced. Uses the
 * site's name if available, falling back to its domain. Returns null if the
 * site is not known.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?String}        Site title
 */
export function getSiteTitle( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	if ( site.name ) {
		return site.name.trim();
	}

	return getSiteDomain( state, siteId );
}

/**
 * Returns the URL for a site, or null if the site is unknown.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?String}        Site Url
 */
export function getSiteUrl( state, siteId ) {
	if ( getSiteOption( state, siteId, 'is_redirect' ) || isSiteConflicting( state, siteId ) ) {
		return getSiteSlug( state, siteId );
	}

	const site = getRawSite( state, siteId );

	if ( ! site ) {
		return null;
	}

	return site.URL;
}

/**
 * Returns true if the site can be previewed, false if the site cannot be
 * previewed, or null if preview ability cannot be determined. This indicates
 * whether it is safe to embed iframe previews for the site.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?Boolean}        Whether site is previewable
 */
export function isSitePreviewable( state, siteId ) {
	if ( ! config.isEnabled( 'preview-layout' ) ) {
		return false;
	}

	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	if ( site.is_vip ) {
		return false;
	}

	const unmappedUrl = getSiteOption( state, siteId, 'unmapped_url' );
	return !! unmappedUrl && isHttps( unmappedUrl );
}

/**
 * Returns a site option for a site
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  optionName The option key
 * @return {*}  The value of that option or null
 */
export function getSiteOption( state, siteId, optionName ) {
	return get( getSiteOptions( state, siteId ), optionName, null );
}

/**
 * Returns true if we are requesting all sites.
 * @param {Object}    state  Global state tree
 * @return {Boolean}        Request State
 */
export function isRequestingSites( state ) {
	return !! state.sites.requestingAll;
}

/**
 * Returns true if a network request is in progress to fetch the specified, or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether request is in progress
 */
export function isRequestingSite( state, siteId ) {
	return !! state.sites.requesting[ siteId ];
}

/**
 * Returns object describing custom title format
 * strings for SEO given a site object.
 *
 * @see client/components/seo/meta-title-editor
 *
 * @param  {Object} site Selected site
 * @return {Object} Formats by type e.g. { frontPage: { type: 'siteName' } }
 */
export const getSeoTitleFormatsForSite = compose(
	seoTitleFromApi,
	partialRight( get, 'options.advanced_seo_title_formats', {} )
);

/**
 * Returns object describing custom title format
 * strings for SEO.
 *
 * @see client/components/seo/meta-title-editor
 *
 * @param  {Object} state  Global app state
 * @param  {Number} siteId Selected site
 * @return {Object} Formats by type e.g. { frontPage: { type: 'siteName' } }
 */
export const getSeoTitleFormats = compose( getSeoTitleFormatsForSite, getRawSite );

export const buildSeoTitle = ( titleFormats, type, { site, post = {}, tag = '', date = '' } ) => {
	const processPiece = ( piece = {}, data ) =>
		'string' === piece.type ? piece.value : get( data, piece.type, '' );

	const buildTitle = ( format, data ) =>
		get( titleFormats, format, [] ).reduce(
			( title, piece ) => title + processPiece( piece, data ),
			''
		);

	switch ( type ) {
		case 'frontPage':
			return (
				buildTitle( 'frontPage', {
					siteName: site.name,
					tagline: site.description,
				} ) || site.name
			);

		case 'posts':
			return (
				buildTitle( 'posts', {
					siteName: site.name,
					tagline: site.description,
					postTitle: get( post, 'title', '' ),
				} ) || get( post, 'title', '' )
			);

		case 'pages':
			return buildTitle( 'pages', {
				siteName: site.name,
				tagline: site.description,
				pageTitle: get( post, 'title', '' ),
			} );

		case 'groups':
			return buildTitle( 'groups', {
				siteName: site.name,
				tagline: site.description,
				groupTitle: tag,
			} );

		case 'archives':
			return buildTitle( 'archives', {
				siteName: site.name,
				tagline: site.description,
				date: date,
			} );

		default:
			return post.title || site.name;
	}
};

export const getSeoTitle = ( state, type, data ) => {
	if ( ! has( data, 'site.ID' ) ) {
		return '';
	}

	const titleFormats = getSeoTitleFormats( state, data.site.ID );

	return buildSeoTitle( titleFormats, type, data );
};

/**
 * Returns a site object by its URL.
 *
 * @param  {Object}  state Global state tree
 * @param  {String}  url   Site URL
 * @return {?Object}       Site object
 */
export function getSiteByUrl( state, url ) {
	const slug = urlToSlug( url );

	return getSiteBySlug( state, slug );
}

/**
 * Returns a site's theme showcase path.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId SiteId
 * @return {?String}        Theme showcase path
 */
export function getSiteThemeShowcasePath( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site || site.jetpack ) {
		return null;
	}

	const [ type, slug ] = split( getSiteOption( state, siteId, 'theme_slug' ), '/', 2 );

	// to accomodate a8c and other theme types
	if ( ! includes( [ 'pub', 'premium' ], type ) ) {
		return null;
	}

	const siteSlug = getSiteSlug( state, siteId );
	return type === 'premium'
		? `/theme/${ slug }/setup/${ siteSlug }`
		: `/theme/${ slug }/${ siteSlug }`;
}

/**
 * Returns a site's plan object by site ID.
 *
 * The difference between this selector and sites/plans/getPlansBySite is that the latter selectors works
 * with the /sites/$site/plans endpoint while the former selectors works with /sites/$site endpoint.
 * Query these endpoints to see if you need the first or the second one.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?Object}        Site's plan object
 */
export function getSitePlan( state, siteId ) {
	const site = getRawSite( state, siteId );

	if ( ! site ) {
		return null;
	}

	if ( get( site.plan, 'expired', false ) ) {
		if ( site.jetpack ) {
			return {
				product_id: 2002,
				product_slug: 'jetpack_free',
				product_name_short: 'Free',
				free_trial: false,
				expired: false,
			};
		}

		return {
			product_id: 1,
			product_slug: 'free_plan',
			product_name_short: 'Free',
			free_trial: false,
			expired: false,
		};
	}

	return site.plan;
}

export function getSitePlanSlug( state, siteId ) {
	return get( getSitePlan( state, siteId ), 'product_slug' );
}

/**
 * Returns true if the current site plan is a paid one
 *
 * @param  {Object}   state         Global state tree
 * @param  {Number}   siteId        Site ID
 * @return {?Boolean}               Whether the current plan is paid
 */
export function isCurrentPlanPaid( state, siteId ) {
	const sitePlan = getSitePlan( state, siteId );

	if ( ! sitePlan ) {
		return null;
	}

	return sitePlan.product_id !== 1 && sitePlan.product_id !== 2002;
}

/**
 * Returns true if site is currently subscribed to supplied plan and false otherwise.
 *
 * @param  {Object}   state         Global state tree
 * @param  {Number}   siteId        Site ID
 * @param  {Number}   planProductId Plan product_id
 * @return {?Boolean}               Whether site's plan matches supplied plan
 */
export function isCurrentSitePlan( state, siteId, planProductId ) {
	if ( planProductId === undefined ) {
		return null;
	}

	const sitePlan = getSitePlan( state, siteId );

	if ( ! sitePlan ) {
		return null;
	}

	return sitePlan.product_id === planProductId;
}

/**
 * Returns the ID of the static page set as the front page, or 0 if a static page is not set.
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @return {Number} ID of the static page set as the front page, or 0 if a static page is not set
 */
export function getSiteFrontPage( state, siteId ) {
	return getSiteOption( state, siteId, 'page_on_front' );
}

/**
 * Returns the ID of the static page set as the page for posts, or 0 if a static page is not set.
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @return {Number} ID of the static page set as page for posts, or 0 if a static page is not set
 */
export function getSitePostsPage( state, siteId ) {
	return getSiteOption( state, siteId, 'page_for_posts' );
}

/**
 * Returns the front page type.
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @return {String} 'posts' if blog posts are set as the front page or 'page' if a static page is
 */
export function getSiteFrontPageType( state, siteId ) {
	return getSiteOption( state, siteId, 'show_on_front' );
}

/**
 * Returns true if the site is using a static front page
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @return {Boolean} False if not set or set to `0`. True otherwise.
 */
export function hasStaticFrontPage( state, siteId ) {
	return !! getSiteFrontPage( state, siteId );
}

/**
 * Determines if a Jetpack site has opted in for full-site management.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} if the site can be managed from calypso
 */
export function canJetpackSiteManage( state, siteId ) {
	// for versions 3.4 and higher, canManage can be determined by the state of the Manage Module
	const siteJetpackVersion = getSiteOption( state, siteId, 'jetpack_version' );

	if ( ! siteJetpackVersion ) {
		return null;
	}

	if ( versionCompare( siteJetpackVersion, '3.4', '>=' ) ) {
		// if we haven't fetched the modules yet, we default to true
		const isModuleActive = isJetpackModuleActive( state, siteId, 'manage' );
		return isModuleActive === null ? true : isModuleActive;
	}
	// for version lower than 3.4, we cannot not determine canManage, we'll assume they can
	return true;
}

/**
 * Determines if a Jetpack site can update its files.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} true if the site can update its file
 */
export function canJetpackSiteUpdateFiles( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	if ( ! siteHasMinimumJetpackVersion( state, siteId ) ) {
		return false;
	}

	const isMultiNetwork = getSiteOption( state, siteId, 'is_multi_network' );

	if ( isMultiNetwork ) {
		return false;
	}

	if ( isJetpackSiteSecondaryNetworkSite( state, siteId ) ) {
		return false;
	}

	const fileModDisabled = getSiteOption( state, siteId, 'file_mod_disabled' );

	if ( ! fileModDisabled ) {
		return true;
	}

	return (
		! includes( fileModDisabled, 'disallow_file_mods' ) &&
		! includes( fileModDisabled, 'has_no_file_system_write_access' )
	);
}

/**
 * Determines if a Jetpack site can auto update its files.
 * This function checks if the given Jetpack site can update its files and if the automatic updater is enabled.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} true if the site can auto update
 */
export function canJetpackSiteAutoUpdateFiles( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	if ( ! canJetpackSiteUpdateFiles( state, siteId ) ) {
		return false;
	}

	const fileModDisabled = getSiteOption( state, siteId, 'file_mod_disabled' );

	if ( fileModDisabled && includes( fileModDisabled, 'automatic_updater_disabled' ) ) {
		return false;
	}

	return true;
}

/**
 * Determines if a Jetpack site can auto update WordPress core.
 * This function is currently identical to canJetpackSiteAutoUpdateFiles.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} true if the site can auto update WordPress
 */
export function canJetpackSiteAutoUpdateCore( state, siteId ) {
	return canJetpackSiteAutoUpdateFiles( state, siteId );
}

/**
 * Determines if the Jetpack plugin of a Jetpack Site has themes.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} true if the site has Jetpack themes management
 */
export function hasJetpackSiteJetpackThemes( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	const siteJetpackVersion = getSiteOption( state, siteId, 'jetpack_version' );
	return versionCompare( siteJetpackVersion, '3.7-beta' ) >= 0;
}

/**
 * Determines if the Jetpack plugin of a Jetpack Site has extend themes management features.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} true if the site has Jetpack extended themes management features
 */
export function hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	const siteJetpackVersion = getSiteOption( state, siteId, 'jetpack_version' );
	return versionCompare( siteJetpackVersion, '4.7' ) >= 0;
}

/**
 * Determines if the Jetpack site is part of multi-site.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?Boolean}        true if the site is multi-site
 */
export function isJetpackSiteMultiSite( state, siteId ) {
	const site = getRawSite( state, siteId );

	if ( ! site || ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	return site.is_multisite === true;
}

/**
 * Determines if a site is the main site in a Network
 * True if it is either in a non multi-site configuration
 * or if its url matches the `main_network_site` url option.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} true if the site is the main site
 */
export function isJetpackSiteMainNetworkSite( state, siteId ) {
	const site = getRawSite( state, siteId );

	if ( ! site || ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	if ( ! site.is_multisite ) {
		return false;
	}

	const unmappedUrl = getSiteOption( state, siteId, 'unmapped_url' );
	const mainNetworkSite = getSiteOption( state, siteId, 'main_network_site' );

	if ( ! unmappedUrl || ! mainNetworkSite ) {
		return false;
	}

	// Compare unmapped_url with the main_network_site to see if is the main network site.
	return withoutHttp( unmappedUrl ) === withoutHttp( mainNetworkSite );
}

/**
 * Determines if a Jetpack site is a secondary network site.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} true if the site is a secondary network site
 */
export function isJetpackSiteSecondaryNetworkSite( state, siteId ) {
	const site = getRawSite( state, siteId );

	if ( ! site || ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	if ( ! site.is_multisite ) {
		return false;
	}

	const unmappedUrl = getSiteOption( state, siteId, 'unmapped_url' ),
		mainNetworkSite = getSiteOption( state, siteId, 'main_network_site' );

	if ( ! unmappedUrl || ! mainNetworkSite ) {
		return false;
	}

	// Compare unmapped_url with the main_network_site to see if is not the main network site.
	return withoutHttp( unmappedUrl ) !== withoutHttp( mainNetworkSite );
}

/**
 * Determines if all given modules are active for a Jetpack Site.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Array} moduleIds A list of active module ids to verify
 * @return {?Boolean} true if the all the given modules are active for this site
 */
export function verifyJetpackModulesActive( state, siteId, moduleIds ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	if ( ! Array.isArray( moduleIds ) ) {
		moduleIds = [ moduleIds ];
	}

	return every( moduleIds, moduleId => isJetpackModuleActive( state, siteId, moduleId ) );
}

/**
 * Returns the remote management url for a Jetpack site.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?String} the remote management url for the site
 */
export function getJetpackSiteRemoteManagementUrl( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	const siteJetpackVersion = getSiteOption( state, siteId, 'jetpack_version' ),
		siteAdminUrl = getSiteOption( state, siteId, 'admin_url' ),
		configure = versionCompare( siteJetpackVersion, '3.4', '>=' ) ? 'manage' : 'json-api';

	return siteAdminUrl + 'admin.php?page=jetpack&configure=' + configure;
}

/**
 * Checks whether a Jetpack site has a custom mapped URL.
 * Returns null if the site is not known, is not a Jetpack site
 * or has an undefined value for `domain` or `unmapped_url`.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} Whether site has custom domain
 */
export function hasJetpackSiteCustomDomain( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	const domain = getSiteDomain( state, siteId ),
		unmappedUrl = getSiteOption( state, siteId, 'unmapped_url' );

	if ( ! domain || ! unmappedUrl ) {
		return null;
	}

	return domain !== withoutHttp( unmappedUrl );
}

/**
 * Returns an explanation on why updates are disabled on a Jetpack Site.
 * Returns null if the site is not known or is not a Jetpack site.
 * Can return an empty array if no reason have been found
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {String} action The update action we wanted to perform on this site
 * @return {?Array<String>} The reasons why file update is disabled
 */
export function getJetpackSiteUpdateFilesDisabledReasons( state, siteId, action = 'modifyFiles' ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	const fileModDisabled = getSiteOption( state, siteId, 'file_mod_disabled' );

	return compact(
		fileModDisabled.map( clue => {
			if (
				action === 'modifyFiles' ||
				action === 'autoupdateFiles' ||
				action === 'autoupdateCore'
			) {
				if ( clue === 'has_no_file_system_write_access' ) {
					return i18n.translate( 'The file permissions on this host prevent editing files.' );
				}
				if ( clue === 'disallow_file_mods' ) {
					return i18n.translate(
						'File modifications are explicitly disabled by a site administrator.'
					);
				}
			}

			if (
				( action === 'autoupdateFiles' || action === 'autoupdateCore' ) &&
				clue === 'automatic_updater_disabled'
			) {
				return i18n.translate( 'Any autoupdates are explicitly disabled by a site administrator.' );
			}

			if ( action === 'autoupdateCore' && clue === 'wp_auto_update_core_disabled' ) {
				return i18n.translate(
					'Core autoupdates are explicitly disabled by a site administrator.'
				);
			}
			return null;
		} )
	);
}

/**
 * Return true is the given Jetpack site has a version equal or greater than
 * the minimum Jetpack version as set by the 'jetpack_min_version' config value.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param  {Object} state - whole state tree
 * @param  {Number} siteId - site id
 * @return {?Boolean} true if the site has minimum jetpack version
 */
export function siteHasMinimumJetpackVersion( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	const siteJetpackVersion = getSiteOption( state, siteId, 'jetpack_version' );
	if ( ! siteJetpackVersion ) {
		return null;
	}

	const jetpackMinVersion = config( 'jetpack_min_version' );

	return versionCompare( siteJetpackVersion, jetpackMinVersion ) >= 0;
}

/**
 * Returns the url to the wp-admin area for a site, or null if the admin URL
 * for the site cannot be determined.
 *
 * @see https://developer.wordpress.org/reference/functions/get_admin_url/
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {?String} path   Admin screen path
 * @return {?String}        Admin URL
 */
export function getSiteAdminUrl( state, siteId, path = '' ) {
	const adminUrl = getSiteOption( state, siteId, 'admin_url' );
	if ( ! adminUrl ) {
		return null;
	}

	return adminUrl + path.replace( /^\//, '' );
}

/**
 * Returns the customizer URL for a site, or null if it cannot be determined.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {String} panel  Optional panel to autofocus
 * @return {String}        Customizer URL
 */
export function getCustomizerUrl( state, siteId, panel ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		const siteSlug = getSiteSlug( state, siteId );
		return [ '' ].concat( compact( [ 'customize', panel, siteSlug ] ) ).join( '/' );
	}

	const adminUrl = getSiteAdminUrl( state, siteId, 'customize.php' );
	if ( ! adminUrl ) {
		return null;
	}

	let returnUrl;
	if ( 'undefined' !== typeof window ) {
		returnUrl = window.location.href;
	}

	return addQueryArgs(
		{
			return: returnUrl,
			...getCustomizerFocus( panel ),
		},
		adminUrl
	);
}

/**
 * Returns true if the site has unchanged site title
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @return {Boolean} True if site title is default, false otherwise.
 */
export const hasDefaultSiteTitle = ( state, siteId ) => {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}
	const slug = getSiteSlug( state, siteId );
	// we are using startsWith here, as getSiteSlug returns "slug.wordpress.com"
	return site.name === i18n.translate( 'Site Title' ) || startsWith( slug, site.name );
};

/**
 * Returns true if the site supports managing Jetpack settings remotely.
 * False otherwise.
 *
 * @param {Object} state  Global state tree
 * @param {Object} siteId Site ID
 * @return {?Boolean}     Whether site supports managing Jetpack settings remotely.
 */
export const siteSupportsJetpackSettingsUi = ( state, siteId ) => {
	return isJetpackMinimumVersion( state, siteId, '4.5.0' );
};

/**
 * Returns true if the version of Jetpack on the site supports Google Analytics IP Anonymization.
 * False otherwise.
 *
 * @param {Object} state  Global state tree
 * @param {Object} siteId Site ID
 * @return {?Boolean}     Whether site supports the setting.
 */
export const siteSupportsGoogleAnalyticsIPAnonymization = ( state, siteId ) => {
	return isJetpackMinimumVersion( state, siteId, '5.4-beta3' );
};

/**
 * Returns true if the version of Jetpack on the site supports Google Analytics Basic eCommerce Tracking.
 * False otherwise.
 *
 * @param {Object} state  Global state tree
 * @param {Object} siteId Site ID
 * @return {?Boolean}     Whether site supports the settings.
 */
export const siteSupportsGoogleAnalyticsBasicEcommerceTracking = ( state, siteId ) => {
	return isJetpackMinimumVersion( state, siteId, '5.4-beta3' );
};

/**
 * Returns true if the version of Jetpack on the site supports Google Analytics Enhanced eCommerce Tracking.
 * False otherwise.
 *
 * @param {Object} state  Global state tree
 * @param {Object} siteId Site ID
 * @return {?Boolean}     Whether site supports the settings.
 */
export const siteSupportsGoogleAnalyticsEnhancedEcommerceTracking = ( state, siteId ) => {
	return isJetpackMinimumVersion( state, siteId, '5.6-beta2' );
};

/**
 * Returns true if the site is created less than 30 mins ago.
 * False otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether site is newly created.
 */
export function isNewSite( state, siteId ) {
	const createdAt = getSiteOption( state, siteId, 'created_at' );

	if ( ! createdAt ) {
		return false;
	}

	// less than 30 minutes
	return moment().diff( createdAt, 'minutes' ) < 30;
}

/**
 * Returns whether all sites have been fetched.
 * @param {Object}    state  Global state tree
 * @return {Boolean}        Request State
 */
export function hasAllSitesList( state ) {
	return !! state.sites.hasAllSitesList;
}

/**
 * Returns the updates object for a site
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {Object} Available updates for the site
 */
export function getUpdatesBySiteId( state, siteId ) {
	return get( getRawSite( state, siteId ), 'updates', null );
}
