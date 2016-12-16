/**
 * External Dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import PostByline from './byline';
import { getStreamUrl } from 'reader/route';

class DiscoverPostByline extends PostByline {

	static propTypes = {
		post: React.PropTypes.object.isRequired,
		site: React.PropTypes.object,
		feed: React.PropTypes.object,
		isDiscoverPost: React.PropTypes.bool,
		showSiteName: React.PropTypes.bool,
		originalPost: React.PropTypes.object,
	}

	getPostAuthor = () => {
		// Will be null for site picks
		return get( this.props.originalPost, 'author' );
	}

	getPostTimeLinkUrl = () => {
		if ( this.props.originalPost ) {
			return get( this.props.originalPost, 'URL' );
		}

		return get( this.props.post, 'discover_metadata.permalink' );
	}

	getStreamUrl = () => {
		const blogId = get( this.props.post, 'discover_metadata.featured_post_wpcom_data.blog_id' );
		return getStreamUrl( null, blogId );
	}

	// @todo
	getSiteIcon = () => {
		return null;
	}

	// @todo
	getFeedIcon = () => {
		return null;
	}
}

export default DiscoverPostByline;
