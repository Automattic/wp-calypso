/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { getPost } from 'state/posts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSite, getSiteTitle } from 'state/sites/selectors';
import SiteIcon from 'blocks/site-icon';

function PostTypeSiteInfo( { site, siteTitle, isAllSitesModeSelected } ) {
	if ( ! isEnabled( 'posts/post-type-list' ) || ! site || ! isAllSitesModeSelected ) {
		return null;
	}

	return (
		<div className="post-type-site-info">
			<SiteIcon size={ 16 } site={ site } />
			<div className="post-type-site-info__title">
				{ siteTitle }
			</div>
		</div>
	);
}

PostTypeSiteInfo.propTypes = {
	globalId: PropTypes.string,
	site: PropTypes.object,
	siteTitle: PropTypes.string,
	isAllSitesModeSelected: PropTypes.bool,
};

export default connect( ( state, ownProps ) => {
	const post = getPost( state, ownProps.globalId );
	const siteId = post ? post.site_ID : null;

	return {
		site: siteId ? getSite( state, siteId ) : null,
		siteTitle: siteId ? getSiteTitle( state, siteId ) : null,
		isAllSitesModeSelected: getSelectedSiteId( state ) === null,
	};
} )( localize( PostTypeSiteInfo ) );
