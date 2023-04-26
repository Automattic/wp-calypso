import { withoutHttp } from 'calypso/lib/url';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import getSiteDomain from './get-site-domain';
import getSiteOption from './get-site-option';
import getSiteOptions from './get-site-options';
import getSiteSlug from './get-site-slug';
import getSiteTitle from './get-site-title';
import isJetpackSite from './is-jetpack-site';
import isSiteConflicting from './is-site-conflicting';

/**
 * Returns computed properties of the site object.
 *
 * @param    {Object}      state    Global state tree
 * @param    {number}      siteId   Site ID
 * @returns  {?Object}              Site computed properties or null
 */
export default function getSiteComputedAttributes( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	const computedAttributes = {
		domain: getSiteDomain( state, siteId ),
		options: getSiteOptions( state, siteId ),
		slug: getSiteSlug( state, siteId ),
		title: getSiteTitle( state, siteId ),
	};

	// If a WordPress.com site has a mapped domain create a `wpcom_url`
	// attribute to allow site selection with either domain.
	if ( getSiteOption( state, siteId, 'is_mapped_domain' ) && ! isJetpackSite( state, siteId ) ) {
		computedAttributes.wpcom_url = withoutHttp( getSiteOption( state, siteId, 'unmapped_url' ) );
	}

	// we only need to use the unmapped URL for conflicting sites
	if ( isSiteConflicting( state, siteId ) ) {
		computedAttributes.URL = getSiteOption( state, siteId, 'unmapped_url' );
	}

	return computedAttributes;
}
