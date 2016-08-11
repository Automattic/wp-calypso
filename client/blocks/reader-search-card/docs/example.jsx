/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import SearchPostCard from 'blocks/reader-search-card';
import DisplayTypes from 'state/reader/posts/display-types';

const searchItems = [
	{
		post: {
			ID: 1,
			title: 'A regular post',
			content: 'Look, I have content!',
			site_ID: 1,
			site_URL: 'http://example.com',
			feed_ID: 1,
			feed_item_ID: 1,
			author: {
				name: 'Sue Smith',
				email: 'sue@example.com'
			},
			discussion: {
				comment_count: 15
			},
			canonical_image: {
				uri: 'https://placekitten.com/600/400',
				width: 300,
				height: 200
			},
			date: '1976-09-15T10:12:00Z',

			excerpt: 'Amazing cat photos updated daily. Come back at three for tabbies.'
		},
		site: {
			ID: 1,
			title: 'My Site'
		},
		feed: {
			feed_ID: 1
		}
	},
	{
		post: {
			ID: 2,
			title: 'A photo post',
			content: 'Look, I have content!',
			site_ID: 2,
			site_URL: 'http://example.com',
			feed_ID: 2,
			feed_item_ID: 2,
			display_type: DisplayTypes.PHOTO_ONLY,
			author: {
				name: 'Sue Smith',
				email: 'sue@example.com'
			},
			discussion: {
				comment_count: 80
			},
			canonical_image: {
				uri: 'https://placekitten.com/600/400',
				width: 300,
				height: 200
			},
			date: '1976-09-15T10:12:00Z',

			excerpt: 'Amazing cat photos updated daily. Come back at three for tabbies.'
		},
		site: {
			ID: 2,
			title: 'My Site'
		},
		feed: {
			feed_ID: 2
		}
	}
];

const SearchCards = React.createClass( {
	displayName: 'SearchCard',

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/post-card">Search Cards</a>
				</h2>

				<div>
					{ searchItems.map( item => <SearchPostCard key={ item.post.site_ID } post={ item.post } site={ item.site } /> ) }
					<h4>With primary follow button</h4>
					{ searchItems.map( item => <SearchPostCard key={ item.post.site_ID } post={ item.post } site={ item.site } showPrimaryFollowButton={ true } /> ) }
				</div>
			</div>
		);
	}
} );

module.exports = SearchCards;
