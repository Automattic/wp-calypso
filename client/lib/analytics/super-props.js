/**
 * External dependencies
 */
import config from 'config';
import { assign } from 'lodash';
/**
 * Internal dependencies
 */

module.exports = {
	getAll: function( selectedSite, siteCount ) {
		let siteProps = {};
		const defaultProps = {
			environment: config( 'env' ),
			site_count: siteCount || 0,
			site_id_label: 'wpcom',
			client: config( 'client_slug' )
		};

		if ( selectedSite ) {
			siteProps = {

				// Tracks expects a blog_id property to identify the blog which is
				// why we use it here instead of calling the property site_id
				blog_id: selectedSite.ID,

				// Tracks expects a blog_lang property to identify the blog language which is
				// why we use it here instead of calling the property site_language
				blog_lang: selectedSite.lang,

				site_id_label: selectedSite.jetpack ? 'jetpack' : 'wpcom',
				site_plan_id: selectedSite.plan ? selectedSite.plan.product_id : null,
				site_post_count: selectedSite.post_count
			};
		}

		return assign( defaultProps, siteProps );
	}
};
