import { getConnectionSpeedData } from '@automattic/calypso-analytics';
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

function getExplicitBlogId( eventProperties ) {
	const blogId = Number( eventProperties.blog_id );
	return Number.isInteger( blogId ) && blogId > 0 ? blogId : null;
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
			...getConnectionSpeedData(),
		} );
	}

	const explicitBlogId = getExplicitBlogId( eventProperties );
	const path = eventProperties.path ?? getCurrentRoute( state ) ?? '';
	const omitSelectedSite =
		( ! eventProperties.force_site_id && shouldReportOmitBlogId( path ) ) ||
		path.startsWith( '/reader' ); // Reader events need to track the blog that is being read, not the user's selected site
	let site = null;
	if ( explicitBlogId ) {
		site = getSite( state, explicitBlogId );
	} else if ( ! omitSelectedSite ) {
		site = getSelectedSite( state ) || getSite( state, getSiteSlugOrIdFromURLSearchParams() );
	}

	if ( explicitBlogId || site ) {
		// Tracks expects a blog_id property to identify the blog which is
		// why we use it here instead of calling the property site_id
		superProps.blog_id = explicitBlogId ?? site.ID;
	}

	if ( site ) {
		Object.assign( superProps, {
			// Tracks expects a blog_lang property to identify the blog language which is
			// why we use it here instead of calling the property site_language
			blog_lang: site.lang,

			site_id_label: site.jetpack ? 'jetpack' : 'wpcom',
			site_plan_id: site.plan ? site.plan.product_id : null,
		} );
	} else if ( explicitBlogId ) {
		delete superProps.site_id_label;
	}

	return superProps;
};

export default getSuperProps;
