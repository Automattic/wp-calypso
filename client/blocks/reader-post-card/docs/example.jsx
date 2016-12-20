/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderPostCardBlock from 'blocks/reader-post-card';
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
				comment_count: 99
			},
			canonical_media: {
				src: 'https://placekitten.com/600/400',
				width: 300,
				height: 200,
				mediaType: 'image',
			},
			date: '1976-09-15T10:12:00Z',

			site: 'cats.wordpress.com',

			better_excerpt_no_html: 'Scamper destroy couch as revenge. Eat the cat food. Refuse to leave cardboard box meowzer! So get video posted to internet for chasing red dot in the house and running around all day...'
		}
	},
	{
		post: {
			ID: 2,
			title: 'A Post Title for Video Embed',
			content: 'Look, I have content!',
			site_ID: 2,
			global_ID: 2,
			site_URL: 'http://example.com',
			feed_ID: 2,
			feed_item_ID: 2,
			author: {
				name: 'Okapi Smith',
				email: 'okapi@example.com'
			},
			discussion: {
				comment_count: 42
			},
			site: 'cats.wordpress.com',
			canonical_media: {
				aspectRatio: 1.641025641025641,
				autoplayIframe: "<iframe data-wpcom-embed-url=\"https://www.youtube.com/watch?v=ptkYu1fdRIM\" class=\"youtube-player\" type=\"text/html\" width=\"640\" height=\"390\" src=\"https://www.youtube.com/embed/ptkYu1fdRIM?version=3&amp;rel=1&amp;fs=1&amp;autohide=2&amp;showsearch=0&amp;showinfo=1&amp;iv_load_policy=1&amp;wmode=transparent&amp;autoplay=1\" allowfullscreen=\"true\" sandbox=\"allow-same-origin allow-scripts allow-popups\"></iframe>",
				embedUrl: "https://www.youtube.com/watch?v=ptkYu1fdRIM",
				height: 390,
				iframe: "<iframe data-wpcom-embed-url=\"https://www.youtube.com/watch?v=ptkYu1fdRIM\" class=\"youtube-player\" type=\"text/html\" width=\"640\" height=\"390\" src=\"https://www.youtube.com/embed/ptkYu1fdRIM?version=3&amp;rel=1&amp;fs=1&amp;autohide=2&amp;showsearch=0&amp;showinfo=1&amp;iv_load_policy=1&amp;wmode=transparent\" allowfullscreen=\"true\" sandbox=\"allow-same-origin allow-scripts allow-popups\"></iframe>",
				src: "https://www.youtube.com/embed/ptkYu1fdRIM?version=3&rel=1&fs=1&autohide=2&showsearch=0&showinfo=1&iv_load_policy=1&wmode=transparent",
				thumbnailUrl: "https://img.youtube.com/vi/ptkYu1fdRIM/mqdefault.jpg",
				type: "youtube",
				mediaType: "video",
				width: 640
			},
			better_excerpt_no_html: 'Scamper destroy couch as revenge. Eat the cat food. Refuse to leave cardboard box meowzer! So get video posted to internet for chasing red dot in the house and running around all day...'
		}
	},
	{
		post: {
			ID: 3,
			title: 'I\'m a photo only card!',
			display_type: DisplayTypes.PHOTO_ONLY,
			content: 'less than 140 characters of content to qualify',
			site_ID: 3,
			global_ID: 3,
			site_URL: 'http://example.com',
			feed_ID: 1,
			feed_item_ID: 1,
			author: {
				name: 'Sue Smith',
				email: 'sue@example.com'
			},
			discussion: {
				comment_count: 42
			},
			canonical_media: {
				src: 'https://placekitten.com/600/400',
				mediaType: 'image',
				width: 300,
				height: 200
			},
			date: '1976-09-15T10:12:00Z',
			site: 'cats.wordpress.com',
			short_excerpt: 'less than 140 characters of content'
		}
	},
	{
		post: {
			ID: 4,
			title: 'Gallery: Posters that will make you want to go vote',
			site_ID: 4,
			global_ID: 4,
			display_type: DisplayTypes.GALLERY,
			site_URL: 'http://example.com',
			feed_ID: 1,
			feed_item_ID: 1,
			author: {
				name: 'Sue Smith',
				email: 'sue@example.com'
			},
			images: [
				{ src: 'https://tedideas.files.wordpress.com/2016/11/miltonglaser11x17.jpg?w=720&quality=80&strip=info', width: 720 },
				{ src: 'https://tedideas.files.wordpress.com/2016/11/gotv_posternataliawarren.jpg?w=720&quality=80&strip=info', width: 720 },
				{ src: 'https://tedideas.files.wordpress.com/2016/11/new-kind11x17_2.jpg?w=720&quality=80&strip=info', width: 720 },
				{ src: 'https://tedideas.files.wordpress.com/2016/11/jesusgarcia_aiga_gotv_yourvotematterseventothem.jpg?w=720&quality=80&strip=info', width: 720 },
			],
			discussion: {
				comment_count: 99
			},
			date: '1976-09-15T10:12:00Z',
			site: 'cats.wordpress.com',
			better_excerpt_no_html: 'Every four years, the Get Out the Vote campaign invites graphic designers to make posters that rally US voters to go to the polls. Here, 14 posters that rock…'
		}
	},
];

const ReaderPostCard = () => (
	<div className="design-assets__group">
		<div>
			{ searchItems.map( item => (
				<ReaderPostCardBlock
					key={ item.post.global_ID }
					post={ item.post }
					site={ item.site }
				/>
			) ) }
		</div>
	</div>
);

export default ReaderPostCard;
