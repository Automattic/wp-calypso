/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import PostByline from './byline';

class DiscoverPostByline extends PostByline {

	static propTypes = {
		post: React.PropTypes.object.isRequired,
		site: React.PropTypes.object,
		feed: React.PropTypes.object,
		isDiscoverPost: React.PropTypes.bool,
		showSiteName: React.PropTypes.bool,
		originalPost: React.PropTypes.object,
	}

	constructor( props ) {
		super( props );
	}

	getPostAuthor = () => {
		return { name: 'Banana' };
	}
}

export default DiscoverPostByline;
