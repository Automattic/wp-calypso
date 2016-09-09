/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import { RelatedPostCard } from 'blocks/reader-related-card-v2';
import DisplayTypes from 'state/reader/posts/display-types';

const smallItems = [
	{
		post: {
			ID: 1,
			title: 'What cats are best for coastal Maine? Do they like to chase around laser pointers?',
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
			},
			short_excerpt: 'Gumbo beet greens corn soko endive gumbo gourd. Parsley shallot courgette tatsoi pea sprouts fava bean collard greens dandelion okra wakame tomato. Dandelion cucumber earthnut pea peanut soko zucchini.'
		},
		site: {
			title: 'All the catsss'
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
			},
			short_excerpt: 'Turnip greens yarrow ricebean rutabaga endive cauliflower sea lettuce kohlrabi amaranth water spinach avocado daikon napa cabbage asparagus winter purslane kale. Celery potato scallion desert raisin horseradish spinach carrot soko.'
		},
		site: {
			title: '99 Problems'
		}
	},
];

const RelatedPostCards = React.createClass( {
	displayName: 'RelatedPostCardv2',

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/post-card">More in Site</a>
				</h2>
				<div className="reader-related-card-v2__container">
					<h1 className="reader-related-card-v2__heading">More in <a href="#" className="reader-related-card-v2__link">Cats and Cats</a></h1>
					<div className="reader-related-card-v2__posts is-site-post">
						{ smallItems.map( item => <RelatedPostCard key={ item.post.global_ID } post={ item.post } site={ item.site } /> ) }
					</div>
				</div>

				<h2>
					<a href="/devdocs/blocks/post-card">More in WordPress.com</a>
				</h2>
				<div className="reader-related-card-v2__container">
					<h1 className="reader-related-card-v2__heading">More in <a href="#" className="reader-related-card-v2__link">WordPress.com</a></h1>
					<div className="reader-related-card-v2__posts is-global-post">
						{ smallItems.map( item => <RelatedPostCard key={ item.post.global_ID } post={ item.post } site={ item.site } /> ) }
					</div>
				</div>
			</div>
		);
	}
} );

module.exports = RelatedPostCards;
