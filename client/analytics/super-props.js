/**
 * External dependencies
 */
var config = require( 'config' ),
	assign = require( 'lodash/assign' );
/**
 * Internal dependencies
 */
var sites = require( 'lib/sites-list' )();

module.exports = {
	getAll: function() {
		var selectedSite = sites.getSelectedSite(),
			siteProps = {},
			defaultProps = {
				environment: config( 'env' ),
				site_count: sites.data ? sites.data.length : 0,
				site_id_label: 'wpcom',
				client: config( 'client_slug' )
			};

		if ( selectedSite ) {
			siteProps = {

				// Tracks expects a blog_id property to identify the blog which is
				// why we use it here instead of calling the property site_id
				blog_id: selectedSite.ID,

				site_id_label: selectedSite.jetpack ? 'jetpack' : 'wpcom',
				site_language: selectedSite.lang,
				site_plan_id: selectedSite.plan ? selectedSite.plan.product_id : null,
				site_post_count: selectedSite.post_count
			};
		}

		return assign( defaultProps, siteProps );
	}
};
