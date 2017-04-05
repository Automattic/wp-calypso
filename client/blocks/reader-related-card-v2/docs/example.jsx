/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import { RelatedPostCard } from 'blocks/reader-related-card-v2';
import Card from 'components/card';

const moreOnSameSite = [
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
			canonical_media: {
				src: 'http://lorempixel.com/256/256/cats/',
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
			canonical_media: {
				src: 'http://lorempixel.com/1024/256/sports/',
				height: 256,
				width: 1024
			},
			site_URL: 'http://discover.wordpress.com',
			short_excerpt: 'Turnip greens yarrow ricebean rutabaga endive cauliflower sea lettuce kohlrabi amaranth water spinach avocado daikon napa cabbage asparagus winter purslane kale. Celery potato scallion desert raisin horseradish spinach carrot soko.'
		},
		site: {
			title: '99 Problems'
		}
	},
];

const moreOnWordPress = [
	{
		post: {
			ID: 3,
			global_ID: 3,
			site_ID: 3,
			author: {
				name: "ConservativeJoe",
			},
			date: "2016-09-27T08:20:33+00:00",
			modified: "2016-09-27T08:20:37+00:00",
			title: "Why Trump should Win the American Election.",
			reading_time: 152,
			better_excerpt: "This presidential race has, to be blunt, a cluster bomb of attacks, lies and outright nonsense rhetoric that has astounded many and made people curse at their screens, newspapers and media agencies they follow.",
			short_excerpt: "This presidential race has, to be blunt, a cluster bomb of attacks, lies and outright nonsense rhetoric that has astounded many and made people curse at their…",
			canonical_image: {
					uri: "https://freedomsandtruth.files.wordpress.com/2016/09/trump-rally-in-vegas-getty-640x480.jpg?w=720&quality=80&strip=info",
			},
			canonical_media: {
					src: "https://freedomsandtruth.files.wordpress.com/2016/09/trump-rally-in-vegas-getty-640x480.jpg?w=720&quality=80&strip=info",
			}
		},
		site: {
			title: 'All the catsss'
		}
	},
	{
		post: {
			ID: 4,
			global_ID: 4,
			site_ID: 4,
			author: {
				name: "LiberalJoe",
			},
			date: "2016-09-27T08:20:33+00:00",
			modified: "2016-09-27T08:20:37+00:00",
			title: "Why Clinton should Win the American Election.",
			reading_time: 152,
			better_excerpt: "This presidential race, has, to be blunt, a lorem ipsum of devdocs demos.  HRC deserves the win because shes been playing the game longer than anybody, especially longer than trump. And she's tough.",
			short_excerpt: "This presidential race has, to be blunt, a cluster bomb of attacks, lies and outright nonsense rhetoric that has astounded many and made people curse at their…",
			canonical_image: {
					uri: "https://lh4.googleusercontent.com/-eXKU4UhFusI/AAAAAAAAAAI/AAAAAAAAATA/1QahWqsqd-I/s0-c-k-no-ns/photo.jpg",
			},
			canonical_media: {
					src: "https://lh4.googleusercontent.com/-eXKU4UhFusI/AAAAAAAAAAI/AAAAAAAAATA/1QahWqsqd-I/s0-c-k-no-ns/photo.jpg",
			}
		},
		site: {
			title: '99 Problems'
		}
	},
];

const RelatedPostCardv2Example = () => (
	<div className="design-assets__group">
		<Card>
		<div className="reader-related-card-v2__blocks is-same-site">
			<h1 className="reader-related-card-v2__heading">More in <a className="reader-related-card-v2__link">Cats and Furballs</a></h1>
				<ul className="reader-related-card-v2__list">
					{ moreOnSameSite.map( item => (
						<li className="reader-related-card-v2__list-item">
							<RelatedPostCard key={ item.post.global_ID } post={ item.post } site={ item.site } />
						</li>
					) ) }
				</ul>
		</div>
		<div className="reader-related-card-v2__blocks is-other-site">
			<h1 className="reader-related-card-v2__heading">More in <a className="reader-related-card-v2__link">WordPress.com</a></h1>
				<ul className="reader-related-card-v2__list">
					{ moreOnWordPress.map( item => (
						<li className="reader-related-card-v2__list-item">
							<RelatedPostCard key={ item.post.global_ID } post={ item.post } site={ item.site } />
						</li>
					) ) }
				</ul>
		</div>
		</Card>
	</div>
);

RelatedPostCardv2Example.displayName = 'RelatedPostCardv2';

export default RelatedPostCardv2Example;
