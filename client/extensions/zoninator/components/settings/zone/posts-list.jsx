/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PostCard from './post-card';
import RecentPostsDropdown from '../../recent-posts-dropdown';
import SearchAutocomplete from './../../search-autocomplete';
import FormFieldset from 'components/forms/form-fieldset';
import SortableList from 'components/forms/sortable-list';

class PostsList extends Component {

	addPost = ( { push } ) => {
		return ( post ) => push( post );
	}

	removePost = ( { remove } ) => {
		return ( idx ) => remove( idx );
	}

	changePostOrder = ( { move } ) => {
		return ( newOrder ) => {
			if ( newOrder.length < 2 ) {
				return;
			}

			// This loop attempts to find to which index in the array has been moved
			// by making the following assumptions:
			// Moved forward: newOrder[ from ] < from.
			// Moved backward by less than one position: same as moving the next item forward.
			// Moved backward by more than one position: newOrder[ from ] > from + 1.
			let from = 0;

			while ( ! ( newOrder[ from ] < from || newOrder[ from ] > from + 1 ) ) {
				from += 1;
			}

			move( from, newOrder[ from ] );
		};
	}

	render() {
		const { fields, translate } = this.props;
		const posts = fields.getAll() || [];
		const showPosts = posts.length > 0;

		return (
			<div>
				<FormFieldset>
					<p className="zone__text">
						{ translate(
							'Add content to the zone by using search or by selecting it from the recent posts list below.'
						) }
					</p>
					<SearchAutocomplete onSelect={ this.addPost( fields ) } ignored={ posts }>
						<RecentPostsDropdown onSelect={ this.addPost( fields ) } ignored={ posts } />
					</SearchAutocomplete>
				</FormFieldset>

				{
					showPosts && <FormFieldset>
						<p className="zone__text">
							{ translate(
								'You can reorder the zone\'s conent by dragging it to a different location on the list.'
							) }
						</p>
						<SortableList direction="vertical" onChange={ this.changePostOrder( fields ) }>
							{ posts.map( ( post, idx ) => (
								<PostCard
									key={ idx }
									post={ post }
									cardIdx={ idx }
									remove={ this.removePost( fields ) } />
							)	) }
						</SortableList>
					</FormFieldset>
				}
			</div>
		);
	}
}

export default localize( PostsList );
