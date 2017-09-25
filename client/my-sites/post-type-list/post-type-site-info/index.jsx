/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SiteIcon from 'blocks/site-icon';
import { getPost } from 'state/posts/selectors';
import { getSite, getSiteTitle } from 'state/sites/selectors';

function PostTypeSiteInfo( { site, siteTitle } ) {
	if ( ! site ) {
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
};

export default connect( ( state, ownProps ) => {
	const post = getPost( state, ownProps.globalId );
	const siteId = post ? post.site_ID : null;

	return {
		site: siteId ? getSite( state, siteId ) : null,
		siteTitle: siteId ? getSiteTitle( state, siteId ) : null,
	};
} )( localize( PostTypeSiteInfo ) );
