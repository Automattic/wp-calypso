var url = require( 'url' );

var
	i18n = require( 'lib/mixins/i18n' ),
	SiteState = require( 'lib/reader-site-store/constants' ).state;

module.exports = {
	siteNameFromSiteAndPost: function( site, post ) {
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
};
