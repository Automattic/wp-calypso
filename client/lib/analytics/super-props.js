import config from '@automattic/calypso-config';
import { shouldReportOmitBlogId } from 'calypso/lib/analytics/utils';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

function getSiteSlugOrIdFromURLSearchParams() {
	const { search = '' } = typeof window !== 'undefined' ? window.location : {};
	const queryParams = new URLSearchParams( search );
	return queryParams.get( 'siteSlug' ) || queryParams.get( 'siteId' );
}

const getSuperProps = ( reduxStore ) => ( eventProperties ) => {
	const state = reduxStore.getState();

	const superProps = {
		environment: process.env.NODE_ENV,
		environment_id: config( 'env_id' ),
		site_count: getCurrentUserSiteCount( state ) || 0,
		site_id_label: 'wpcom',
		client: config( 'client_slug' ),
	};

	if ( typeof window !== 'undefined' ) {
		Object.assign( superProps, {
			vph: window.innerHeight,
			vpw: window.innerWidth,
		} );
	}

	const path = eventProperties.path ?? getCurrentRoute( state );
	const omitSelectedSite =
		( ! eventProperties.force_site_id && shouldReportOmitBlogId( path ) ) ||
		path.startsWith( '/reader' ); // Reader events need to track the blog that is being read, not the user's selected site
	const selectedSite = omitSelectedSite
		? null
		: getSelectedSite( state ) || getSite( state, getSiteSlugOrIdFromURLSearchParams() );

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
