/** @format */

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
import { abtest } from 'lib/abtest';
import { mapPostStatus } from 'lib/route/path';

class PostListWrapper extends React.Component {
	constructor( props ) {
		super( props );
	}

	renderPostList() {
		return <PostList { ...this.props } />;
	}

	renderPostTypeList() {
		const query = {
			status: mapPostStatus( this.props.statusSlug ),
			author: this.props.author,
			search: this.props.search,
			number: 20, // max supported by /me/posts endpoint for all-sites mode
		};

		if ( this.props.category ) {
			query.category = this.props.category;
		}
		if ( this.props.tag ) {
			query.tag = this.props.tag;
		}
		if ( this.props.withCounts ) {
			query.meta = 'counts';
		}

		return (
			<PostTypeList
				query={ query }
				largeTitles={ true }
				wrapTitles={ true }
				scrollContainer={ document.body }
			/>
		);
	}

	render() {
		return (
			<div>
				{ config.isEnabled( 'posts/post-type-list' ) &&
				abtest( 'condensedPostList' ) === 'condensedPosts'
					? this.renderPostTypeList()
					: this.renderPostList() }
			</div>
		);
	}
}

export default PostListWrapper;
