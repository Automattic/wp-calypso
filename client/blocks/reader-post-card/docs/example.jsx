/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import RefreshPostCard from 'blocks/reader-post-card';
import DisplayTypes from 'state/reader/posts/display-types';

const searchItems = [
	{
		post: {
			ID: 1,
			title: 'A Post Title',
			content: 'Look, I have content!',
			site_ID: 1,
			global_ID: 1,
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

			site: 'cats.wordpress.com',

			short_excerpt: 'Scamper destroy couch as revenge. Eat the cat food. Refuse to leave cardboard box meowzer! So get video posted to internet for chasing red dot in the house and running around all day...'
		}
	}
];

const RefreshCards = React.createClass( {
	displayName: 'RefreshCard',

	render: function() {
		return (
			<div className="design-assets__group">
				<div>
					{ searchItems.map( item => <RefreshPostCard key={ item.post.global_ID } post={ item.post } site={ item.site } /> ) }
				</div>
			</div>
		);
	}
} );

module.exports = RefreshCards;
