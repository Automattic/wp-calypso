import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getFashionBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 171275704,
		site_ID: 0,
		name: 'Who What Wear',
		site_URL: 'https://www.whowhatwear.com/',
		feed_URL: 'https://www.whowhatwear.com/feeds/all',
		icon_URL: 'https://cdn.mos.cms.futurecdn.net/flexiimages/qzgqdurjen1667467717.png',
		description: __( 'Fashion news, outfit ideas, and practical guidance on personal style.' ),
	},
	{
		feed_ID: 9139855,
		site_ID: 0,
		name: 'The Cut',
		site_URL: 'https://www.thecut.com/',
		feed_URL: 'https://feeds.feedburner.com/nymag/fashion',
		icon_URL: 'https://assets.thecut.com/media/sites/wwwthecut/icon.180x180.png',
		description: __(
			'Fashion, beauty, personal style, and conversations about contemporary culture.'
		),
	},
	{
		feed_ID: 23209601,
		site_ID: 0,
		name: 'Corporette',
		site_URL: 'https://corporette.com/',
		feed_URL: 'https://corporette.com/feed/',
		icon_URL: 'https://corporette.com/wp-content/uploads/2018/11/corporette-favicon-400x400.png',
		description: __(
			'Workwear ideas, professional style, and practical fashion for working women.'
		),
	},
	{
		feed_ID: 101819175,
		site_ID: 0,
		name: 'Atlantic-Pacific',
		site_URL: 'https://www.the-atlantic-pacific.com/',
		feed_URL: 'https://www.the-atlantic-pacific.com/feed/',
		icon_URL:
			'https://www.the-atlantic-pacific.com/wp-content/uploads/2016/11/ms-icon-310x310-300x300.png',
		description: __(
			'Personal style, colorful outfits, and fashion inspiration from Blair Eadie.'
		),
	},
	{
		feed_ID: 50580682,
		site_ID: 0,
		name: 'Permanent Style',
		site_URL: 'https://www.permanentstyle.com/',
		feed_URL: 'https://www.permanentstyle.com/feed',
		icon_URL: 'https://www.permanentstyle.com/wp-content/themes/ps22/favicon/favicon.png',
		description: __( 'Thoughtful menswear, tailoring, and advice on building a lasting wardrobe.' ),
	},
	{
		feed_ID: 23620941,
		site_ID: 0,
		name: 'Gentleman’s Gazette',
		site_URL: 'https://www.gentlemansgazette.com/',
		feed_URL: 'https://www.gentlemansgazette.com/feed/',
		icon_URL:
			'https://i0.wp.com/www.gentlemansgazette.com/wp-content/uploads/2024/11/Logo-Square256t.png',
		description: __(
			'Classic menswear, clothing history, and practical guidance on dressing well.'
		),
	},
	{
		feed_ID: 81415115,
		site_ID: 139369064,
		name: 'FashionBeans',
		site_URL: 'https://www.fashionbeans.com/',
		feed_URL: 'https://www.fashionbeans.com/feed/',
		icon_URL:
			'https://i0.wp.com/www.fashionbeans.com/wp-content/uploads/2022/11/FB_Favicon_48x48.png',
		description: __(
			'Menswear, outfit ideas, grooming, and practical guidance on personal style.'
		),
	},
	{
		feed_ID: 20742837,
		site_ID: 61181017,
		name: 'Fashion Jackson',
		site_URL: 'https://fashionjackson.com/',
		feed_URL: 'https://fashionjackson.com/feed/',
		icon_URL: 'https://static.showit.co/200/f9gF8RM36IiqQESgf81eHA/274240/favicon_512.png',
		description: __( 'Everyday outfit ideas, wardrobe staples, and personal-style inspiration.' ),
	},
	{
		feed_ID: 71491737,
		site_ID: 0,
		name: 'Vogue',
		site_URL: 'https://www.vogue.com/',
		feed_URL: 'https://www.vogue.com/feed/rss',
		icon_URL: 'https://www.vogue.com/verso/static/vogue-global/assets/us/favicon.ico',
		description: __(
			'Fashion reporting, runway coverage, designer interviews, and personal style.'
		),
	},
	{
		feed_ID: 239264,
		site_ID: 0,
		name: 'Elle',
		site_URL: 'https://www.elle.com/',
		feed_URL: 'https://www.elle.com/rss/all.xml/',
		icon_URL:
			'https://www.elle.com/_assets/design-tokens/elle/static/images/apple-touch-icon.0dd915e.png',
		description: __( 'Fashion news, style ideas, designer coverage, and cultural discoveries.' ),
	},
	{
		feed_ID: 43183938,
		site_ID: 83216847,
		name: 'Style at a Certain Age',
		site_URL: 'https://www.styleatacertainage.com/',
		feed_URL: 'https://www.styleatacertainage.com/feed/',
		icon_URL:
			'https://i0.wp.com/www.styleatacertainage.com/wp-content/uploads/2024/12/Style-At-A-Certain-Age-and-Every-Age-Branding-Headshot-Photos-of-Beth-Kelly-and-Chelsea-Djalali-23-520x670.jpg',
		description: __(
			'Personal style, practical outfits, and fashion inspiration for life after fifty.'
		),
	},
	{
		feed_ID: 23373250,
		site_ID: 0,
		name: 'The Curvy Fashionista',
		site_URL: 'https://thecurvyfashionista.com/',
		feed_URL: 'https://thecurvyfashionista.com/feed/',
		icon_URL:
			'https://thecurvyfashionista.com/wp-content/uploads/2025/01/cropped-TCF-favicon-180x180.png',
		description: __(
			'Plus-size fashion, style inspiration, and conversations about inclusive clothing.'
		),
	},
];
