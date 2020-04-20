/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { shouldReportOmitBlogId } from 'lib/analytics/utils';
import { getSelectedSite } from 'state/ui/selectors';
import { getCurrentUserSiteCount } from 'state/current-user/selectors';

const getSuperProps = ( reduxStore ) => ( eventProperties ) => {
	const state = reduxStore.getState();

	const superProps = {
		environment: process.env.NODE_ENV,
		environment_id: config( 'env_id' ),
		site_count: getCurrentUserSiteCount( state ) || 0,
		site_id_label: 'wpcom',
		client: config( 'client_slug' ),
	};

	const omitSelectedSite = shouldReportOmitBlogId( eventProperties.path );
	const selectedSite = omitSelectedSite ? null : getSelectedSite( state );

	if ( selectedSite ) {
		Object.assign( superProps, {
			// Tracks expects a blog_id property to identify the blog which is
			// why we use it here instead of calling the property site_id
			blog_id: selectedSite.ID,

			// Tracks expects a blog_lang property to identify the blog language which is
			// why we use it here instead of calling the property site_language
			blog_lang: selectedSite.lang,

			site_id_label: selectedSite.jetpack ? 'jetpack' : 'wpcom',
			site_plan_id: selectedSite.plan ? selectedSite.plan.product_id : null,
		} );
	}

	return superProps;
};

export default getSuperProps;
