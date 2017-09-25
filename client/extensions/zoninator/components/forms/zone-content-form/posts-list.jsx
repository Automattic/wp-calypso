/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { findIndex, map } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import RecentPostsDropdown from '../../recent-posts-dropdown';
import SearchAutocomplete from './../../search-autocomplete';
import PostCard from './post-card';
import FormFieldset from 'components/forms/form-fieldset';
import SortableList from 'components/forms/sortable-list';

class PostsList extends Component {

	static propTypes = {
		fields: PropTypes.object.isRequired,
		translate: PropTypes.func.isRequired,
	};

	addPost = ( { push } ) => post => push( {
		id: post.ID,
		siteId: post.site_ID,
		title: post.title,
		url: post.URL,
	} );

	removePost = ( { remove }, index ) => () => remove( index );

	changePostOrder = ( { move } ) => newOrder => {
		if ( newOrder.length < 2 ) {
			return;
		}

		// This loop attempts to find to which index in the array has been moved
		// by making the following assumptions:
		// Moved forward: newIndex < index.
		// Moved backward by less than one position: same as moving the next item forward.
		// Moved backward by more than one position: newIndex > index + 1.
		const from = findIndex( newOrder, ( newIndex, index ) => newIndex < index || newIndex > index + 1 );

		move( from, newOrder[ from ] );
	}

	render() {
		const { fields, translate } = this.props;
		const posts = fields.getAll() || [];
		const showPosts = posts.length > 0;

		const explanationTextClass = 'zoninator__zone-text';

		return (
			<div>
				<FormFieldset>
					<p className={ explanationTextClass }>
						{ translate(
							'Add content to the zone by using search or by selecting it from the recent posts list below.'
						) }
					</p>
					<SearchAutocomplete onSelect={ this.addPost( fields ) } exclude={ map( posts, post => post.id ) }>
						<RecentPostsDropdown onSelect={ this.addPost( fields ) } exclude={ map( posts, post => post.id ) } />
					</SearchAutocomplete>
				</FormFieldset>

				{
					showPosts && <FormFieldset>
						<p className={ explanationTextClass }>
							{ translate(
								'You can reorder the zone\'s content by dragging it to a different location on the list.'
							) }
						</p>
						<SortableList direction="vertical" onChange={ this.changePostOrder( fields ) }>
							{ posts.map( ( post, index ) => (
								<PostCard
									key={ index }
									post={ post }
									remove={ this.removePost( fields, index ) } />
							)	) }
						</SortableList>
					</FormFieldset>
				}
			</div>
		);
	}
}

export default localize( PostsList );
