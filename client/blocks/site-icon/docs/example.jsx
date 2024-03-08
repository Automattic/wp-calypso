import { get } from 'lodash';
import { connect } from 'react-redux';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import SiteIcon from '../';

/**
 * Site ID of en.blog.wordpress.com, to be used as fallback for SiteIcon if
 * current user does not have a primary site.
 * @type {number}
 */
const EN_BLOG_SITE_ID = 3584907;

const SiteIconExample = ( { siteId } ) => <SiteIcon siteId={ siteId || EN_BLOG_SITE_ID } />;

const ConnectedSiteIconExample = connect( ( state ) => ( {
	siteId: get( getCurrentUser( state ), 'primary_blog' ),
} ) )( SiteIconExample );

ConnectedSiteIconExample.displayName = 'SiteIcon';

export default ConnectedSiteIconExample;
