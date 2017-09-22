/**
 * Internal dependencies
 */
import {
	getRawSite,
	getSiteDomain,
	getSiteOption,
	getSiteSlug,
	getSiteTitle,
	isJetpackSite,
	isSiteConflicting,
	isSitePreviewable
} from 'state/sites/selectors';
import { canCurrentUser, getSiteOptions } from 'state/selectors';
import { withoutHttp } from 'lib/url';

/**
 * Returns computed properties of the site object.
 *
 * @param    {Object}      state    Global state tree
 * @param    {Number}      siteId   Site ID
 * @returns  {?Object}              Site computed properties or null
 */
export const getSiteComputedAttributes = ( state, siteId ) => {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	const computedAttributes = {
		domain: getSiteDomain( state, siteId ),
		hasConflict: isSiteConflicting( state, siteId ),
		is_customizable: !! canCurrentUser( state, siteId, 'edit_theme_options' ),
		is_previewable: !! isSitePreviewable( state, siteId ),
		options: getSiteOptions( state, siteId ),
		slug: getSiteSlug( state, siteId ),
		title: getSiteTitle( state, siteId )
	};

	// If a WordPress.com site has a mapped domain create a `wpcom_url`
	// attribute to allow site selection with either domain.
	if ( getSiteOption( state, siteId, 'is_mapped_domain' ) && ! isJetpackSite( state, siteId ) ) {
		computedAttributes.wpcom_url = withoutHttp( getSiteOption( state, siteId, 'unmapped_url' ) );
	}

	// we only need to use the unmapped URL for conflicting sites
	if ( computedAttributes.hasConflict ) {
		computedAttributes.URL = getSiteOption( state, siteId, 'unmapped_url' );
	}

	return computedAttributes;
};
