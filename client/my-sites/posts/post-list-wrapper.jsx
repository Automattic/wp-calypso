/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PostList from './post-list';
import PostTypeList from 'my-sites/post-type-list';
import config from 'config';

class PostListWrapper extends React.Component {

	constructor( props ) {
		super( props );
	}

	renderPostList() {
		return (
			<PostList { ...this.props } />
		);
	}

	renderPostTypeList() {
		return (
			<PostTypeList
				query={
					{
						type: 'post',
					}
				}
				siteId={ this.props.siteId }
			/>
		);
	}

	render() {
		return (
			<div>
				{ config.isEnabled( 'posts/post-type-list' )
					? this.renderPostTypeList()
					: this.renderPostList()

				}
			</div>
		);
	}
}

export default PostListWrapper;
