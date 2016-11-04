/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import { RelatedPostCard } from 'blocks/reader-related-card-v2';
import Card from 'components/card';

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
			site_URL: 'http://discover.wordpress.com',
			short_excerpt: 'Gumbo beet greens corn soko endive gumbo gourd. Parsley shallot courgette tatsoi pea sprouts fava bean collard greens dandelion okra wakame tomato. Dandelion cucumber earthnut pea peanut soko zucchini.'
		},
		site: {
			title: 'All the catsss'
		}
	},
];

const RelatedPostCardv2Example = () => (
	<div className="design-assets__group">
		<Card>
		<div className="reader-related-card-v2__blocks is-same-site">
			<h1 className="reader-related-card-v2__heading">More in <a className="reader-related-card-v2__link">Cats and Furballs</a></h1>
				<ul className="reader-related-card-v2__list">
					<li className="reader-related-card-v2__list-item">{ smallItems.map( item => <RelatedPostCard key={ item.post.global_ID } post={ item.post } site={ item.site } /> ) }</li>
					<li className="reader-related-card-v2__list-item">{ smallItems.map( item => <RelatedPostCard key={ item.post.global_ID } post={ item.post } site={ item.site } /> ) }</li>
				</ul>
		</div>
		<div className="reader-related-card-v2__blocks is-other-site">
			<h1 className="reader-related-card-v2__heading">More in <a className="reader-related-card-v2__link">WordPress.com</a></h1>
				<ul className="reader-related-card-v2__list">
					<li className="reader-related-card-v2__list-item">{ smallItems.map( item => <RelatedPostCard key={ item.post.global_ID } post={ item.post } site={ item.site } /> ) }</li>
					<li className="reader-related-card-v2__list-item">{ smallItems.map( item => <RelatedPostCard key={ item.post.global_ID } post={ item.post } site={ item.site } /> ) }</li>
				</ul>
		</div>
		</Card>
	</div>
);

RelatedPostCardv2Example.displayName = 'RelatedPostCardv2';

export default RelatedPostCardv2Example;
