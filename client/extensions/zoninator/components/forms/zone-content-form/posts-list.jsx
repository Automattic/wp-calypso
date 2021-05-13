/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { map, times } from 'lodash';

/**
 * Internal dependencies
 */
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SortableList from 'calypso/components/forms/sortable-list';
import PostCard from './post-card';
import PostPlaceholder from './post-placeholder';
import RecentPostsDropdown from '../../recent-posts-dropdown';
import SearchAutocomplete from './../../search-autocomplete';

class PostsList extends Component {
	static propTypes = {
		posts: PropTypes.array.isRequired,
		requesting: PropTypes.bool,
		translate: PropTypes.func.isRequired,
		updatePosts: PropTypes.func.isRequired,
	};

	addPost = ( post ) => {
		const { posts, updatePosts } = this.props;

		const updatedPosts = [
			...posts,
			{
				id: post.ID,
				siteId: post.site_ID,
				title: post.title,
				url: post.URL,
			},
		];

		updatePosts( updatedPosts );
	};

	removePost = ( index ) => () => {
		const { posts, updatePosts } = this.props;
		const updatedPosts = [ ...posts ];

		updatedPosts.splice( index, 1 );

		updatePosts( updatedPosts );
	};

	changePostOrder = ( newOrder ) => {
		const { posts, updatePosts } = this.props;
		if ( newOrder.length < 2 ) {
			return;
		}

		const updatedPosts = [];
		newOrder.map( ( newIndex, oldIndex ) => ( updatedPosts[ newIndex ] = posts[ oldIndex ] ) );
		updatePosts( updatedPosts );
	};

	render() {
		const { posts, requesting, translate } = this.props;

		const explanationTextClass = 'zoninator__zone-text';

		return (
			<div>
				<FormFieldset>
					<p className={ explanationTextClass }>
						{ translate(
							'Add content to the zone by using search or by selecting it from the recent posts list below.'
						) }
					</p>
					<SearchAutocomplete
						onSelect={ this.addPost }
						exclude={ map( posts, ( post ) => post.id ) }
					>
						<RecentPostsDropdown
							onSelect={ this.addPost }
							exclude={ map( posts, ( post ) => post.id ) }
						/>
					</SearchAutocomplete>
				</FormFieldset>

				{ !! posts.length && ! requesting && (
					<FormFieldset>
						<p className={ explanationTextClass }>
							{ translate(
								"You can reorder the zone's content by dragging it to a different location on the list."
							) }
						</p>
						<SortableList direction="vertical" onChange={ this.changePostOrder }>
							{ posts.map( ( post, index ) => (
								<PostCard
									key={ post.id }
									postId={ post.id }
									postTitle={ post.title }
									siteId={ post.siteId }
									remove={ this.removePost( index ) }
								/>
							) ) }
						</SortableList>
					</FormFieldset>
				) }

				{ requesting && times( 3, ( index ) => <PostPlaceholder key={ index } /> ) }
			</div>
		);
	}
}

export default localize( PostsList );
