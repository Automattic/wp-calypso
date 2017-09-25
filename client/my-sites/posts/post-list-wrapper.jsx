/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PostList from './post-list';
import PostListFetcher from 'components/post-list-fetcher';
import config from 'config';
import { mapPostStatus } from 'lib/route/path';
import PostTypeList from 'my-sites/post-type-list';

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
		const query = {
			status: mapPostStatus( this.props.statusSlug ),
			author: this.props.author,
			search: this.props.search,
			category: this.props.category,
			tag: this.props.tag,
		};

		if ( this.props.withCounts ) {
			query.meta = 'counts';
		}

		return (
			<div>
				<PostListFetcher
					siteId={ this.props.siteId }
					status={ mapPostStatus( this.props.statusSlug ) }
					author={ this.props.author }
					withImages={ true }
					withCounts={ true }
					search={ this.props.search }
					category={ this.props.category }
					tag={ this.props.tag }
				>
					<PostTypeList
						query={ query }
						largeTitles={ true }
						wrapTitles={ true }
					/>
				</PostListFetcher>
			</div>
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
