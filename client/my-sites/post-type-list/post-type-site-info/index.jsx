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
import { getPost } from 'calypso/state/posts/selectors';
import { getSite, getSiteTitle } from 'calypso/state/sites/selectors';
import SiteIcon from 'calypso/blocks/site-icon';

/**
 * Style dependencies
 */
import './style.scss';

function PostTypeSiteInfo( { site, siteTitle } ) {
	if ( ! site ) {
		return null;
	}

	return (
		<div className="post-type-site-info">
			<SiteIcon size={ 16 } site={ site } />
			<div className="post-type-site-info__title">{ siteTitle }</div>
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
