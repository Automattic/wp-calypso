/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import RelatedPostCardv2 from 'blocks/reader-related-card-v2';
import DisplayTypes from 'state/reader/posts/display-types';

const smallItems = [
	{
		post: {
			ID: 1,
			title: 'What cats are best for coastal Maine?',
			site_ID: 1234,
			site_name: 'All the catsss',
			global_ID: 1,
			author: {
				name: 'wolvy'
			},
			canonical_image: {
				uri: 'http://lorempixel.com/256/256/cats/',
				height: 256,
				width: 256
			}
		},
		site: {
			ID: 1234,
			title: 'All the cats',
			URL: 'http://www.allthecats.com',
			icon: {
				img: 'http://lorempixel.com/64/64/cats/'
			}
		}
	},
	{
		post: {
			ID: 2,
			title: 'No Site? No Problem.',
			site_ID: 99,
			site_name: '99 Problems',
			global_ID: 2,
			author: {
				name: 'wolvy'
			},
			canonical_image: {
				uri: 'http://lorempixel.com/1024/256/sports/',
				height: 256,
				width: 1024
			}
		}
	},
];

const RelatedPostCards = React.createClass( {
	displayName: 'RelatedPostCardv2',

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/post-card">Refresh Related Cards</a>
				</h2>
				<div className="reader-related-card-v2__container">
					{ smallItems.map( item => <RelatedPostCardv2 key={ item.post.global_ID } post={ item.post } site={ item.site } /> ) }
				</div>
			</div>
		);
	}
} );

module.exports = RelatedPostCards;
