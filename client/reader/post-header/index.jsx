/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Site from 'blocks/site';
import FollowButton from 'reader/follow-button';

const PostHeader = ( { site, siteUrl, showFollow, onSiteSelect, onSiteClick } ) => (
	<div className="reader__post-header">
		{ showFollow ? <FollowButton siteUrl={ siteUrl } /> : null }
		<Site site={ site }
			href={ siteUrl }
			onSelect={ onSiteSelect }
			onClick={ onSiteClick } />
	</div>
);

PostHeader.propTypes = {
	site: React.PropTypes.object,
	siteUrl: React.PropTypes.string,
	showFollow: React.PropTypes.bool,
	onSiteSelect: React.PropTypes.func,
	onSiteClick: React.PropTypes.func
};

PostHeader.defaultProps = {
	showFollow: false,
	onSiteSelect: noop,
	onSiteClick: noop
};

export default PostHeader;
