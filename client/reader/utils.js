const url = require( 'url' );

const i18n = require( 'i18n-calypso' ),
	SiteState = require( 'lib/reader-site-store/constants' ).state,
	FeedDisplayHelper = require( 'reader/lib/feed-display-helper' );

function siteNameFromSiteAndPost( site, post ) {
	var siteName;

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
function siteishFromSiteAndPost( site, post ) {
	if ( site ) {
		return site.toJS();
	}

	if ( post ) {
		return {
			title: siteNameFromSiteAndPost( site, post ),
			domain: FeedDisplayHelper.formatUrlForDisplay( post.site_URL )
		};
	}

	return {
		title: '',
		domain: ''
	};
}

function isSpecialClick( event ) {
	return event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey;
}

function isPostNotFound( post ) {
	if ( post === undefined ) {
		return false;
	}

	return post.statusCode === 404;
}

module.exports = {
	siteNameFromSiteAndPost,
	siteishFromSiteAndPost,
	isSpecialClick,
	isPostNotFound
};
