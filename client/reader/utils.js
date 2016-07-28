/**
 * External dependencies
 */
import url from 'url';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import i18n from 'i18n-calypso';
import { state as SiteState } from 'lib/reader-site-store/constants';
import FeedDisplayHelper from 'reader/lib/feed-display-helper';
import * as discoverHelper from 'reader/discover/helper';

export function siteNameFromSiteAndPost( site, post ) {
	let siteName;

	if ( site && site.get( 'state' ) === SiteState.COMPLETE ) {
		siteName = site.get( 'title' ) || site.get( 'domain' );
	} else if ( post ) {
		if ( post.site_name ) {
			siteName = post.site_name;
		} else if ( post.site_URL ) {
			siteName = url.parse( post.site_URL ).hostname;
		}
	}

	if ( ! siteName ) {
		siteName = i18n.translate( '(no title)' );
	}

	return siteName;
}

/**
 * Creates a site-like object from a site and a post.
 *
 * Compliant with what things like the <Site /> object expects
 * @param  {Immutable.Map} site A Reader site (Immutable)
 * @param  {Object} post A Reader post
 * @return {Object}      A site like object
 */
export function siteishFromSiteAndPost( site, post ) {
	if ( discoverHelper.isDiscoverSitePick( post ) ) {
		const discoverAttribution = discoverHelper.getAttribution( post );
		return {
			title: get( discoverAttribution, 'blog_name' ),
			domain: FeedDisplayHelper.formatUrlForDisplay( get( discoverAttribution, 'blog_url' ) )
		};
	}

	if ( site ) {
		return site.toJS();
	}

	if ( post ) {
		return {
			title: siteNameFromSiteAndPost( site, post ),
			domain: FeedDisplayHelper.formatUrlForDisplay( get( post, 'site_URL' ) )
		};
	}

	return {
		title: '',
		domain: ''
	};
}

export function isSpecialClick( event ) {
	return event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey;
}

export function isPostNotFound( post ) {
	if ( post === undefined ) {
		return false;
	}

	return post.statusCode === 404;
}

