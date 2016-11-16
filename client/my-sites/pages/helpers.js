/**
 * External dependencies
 */
import merge from 'lodash/merge';
import store from 'store';

/**
 * Internal dependencies
 */
import sitesFactory from 'lib/sites-list';

module.exports = {
	editLinkForPage: function( page, site ) {
		if ( ! ( page && page.ID ) || ! ( site && site.ID ) ) {
			return null;
		}

		return '/page/' + site.slug + '/' + page.ID;
	},

	// TODO: switch all usage of this function to `isFrontPage` in `state/pages/selectors`
	isFrontPage: function( page, site ) {
		if ( ! page || ! page.ID || ! site || ! site.options ) {
			return false;
		}
		return site.options.page_on_front === page.ID;
	},

	// This gives us a means to fix the `SitesList` cache outside of actions
	// @todo Remove this when `SitesList` is Reduxified
	updateSitesList: function( { siteId, updatedOptions } ) {
		const sites = sitesFactory();
		const site = sites.getSite( siteId );

		store.remove( 'SitesList' );
		if ( site ) {
			site.options = merge( site.options, updatedOptions );
			sites.updateSite( site );
		}
		sites.fetch();
	},
};
