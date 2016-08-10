/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import RelatedPostCard from 'blocks/reader-related-card';
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
	{
		post: {
			ID: 3,
			title: 'Seven weird numbers that are even lonlier than one. You won\'t believe number 4',
			site_ID: 7,
			site_name: 'Made You Click! Made You Click! Made You Click! Made You Click! Made You Click! Made You Click! Made You Click! Made You Click! Made You Click! Made You Click!',
			global_ID: 3,
			author: {
				name: 'wolvy'
			},
			canonical_image: {
				uri: 'http://lorempixel.com/128/96/sports/',
				height: 96,
				width: 128
			}
		}
	},
	{
		post: {
			ID: 2,
			title: 'No Image? No Problem. We don\'t need an image where we\'re going',
			site_ID: 99,
			site_name: 'The text only web is the only web we need.',
			global_ID: 4,
			author: {
				name: 'wolvy'
			}
		}
	},
];

const RelatedPostCards = React.createClass( {
	displayName: 'RelatedPostCard',

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/post-card">Related Post Cards</a>
				</h2>
				<div>
					{ smallItems.map( item => <RelatedPostCard key={ item.post.global_ID } post={ item.post } site={ item.site } /> ) }
				</div>
			</div>
		);
	}
} );

module.exports = RelatedPostCards;
