/**
 * External Dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import PostByline from './byline';
//import * as DiscoverHelper from 'reader/discover/helper';

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
		return { name: 'Banana' };
	}

	getPostTimeLinkUrl = () => {
		if ( this.props.originalPost ) {
			return get( this.props.originalPost, 'URL' );
		}

		return get( this.props.post, 'discover_metadata.permalink' );
	}
}

export default DiscoverPostByline;
