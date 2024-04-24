import { Substitution, translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { preventWidows } from 'calypso/lib/formatting';
import { PatternsSearchField } from 'calypso/my-sites/patterns/components/search-field';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { PatternTypeFilter, type Category } from 'calypso/my-sites/patterns/types';

import './style.scss';

type ContentEntryRegular = {
	title: Substitution;
	metaDescription: Substitution;
	patternsHeading: Substitution;
	patternsDescription: Substitution;
};

type ContentEntryLayouts = ContentEntryRegular & {
	layoutsMetaDescription: Substitution;
	layoutsHeading: Substitution;
	layoutsDescription: Substitution;
};

type ContentEntry = ContentEntryRegular | ContentEntryLayouts;

const CONTENT: Record< Category[ 'name' ], ContentEntry > = {
	default: {
		title: translate( 'WordPress Patterns', {
			comment: 'HTML title of the Pattern Library home page',
		} ),
		metaDescription: translate(
			'Dive into hundreds of expertly designed, fully responsive layouts, and bring any kind of site to life, faster.',
			{ comment: 'Intro text on the Pattern Library home page' }
		),
		patternsHeading: translate( "It's Easier With Patterns", {
			comment: 'Heading of the Pattern Library home page',
		} ),
		patternsDescription: translate(
			'Dive into hundreds of expertly designed, fully responsive layouts, and bring any kind of site to life, faster.',
			{ comment: 'Intro text on the Pattern Library home page' }
		),
	},
	header: {
		title: translate( 'Header WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Headers" category page',
		} ),
		metaDescription: translate(
			'Get a head start with patterns. Use beautiful patterns to decorate the header and main menu of your site, and catch your visitors’ attention.',
			{ comment: 'SEO meta description for the Pattern Library "Headers" category page' }
		),
		patternsHeading: translate( 'Header Patterns', {
			comment: 'Heading of the Pattern Library "Headers" category page',
		} ),
		patternsDescription: translate(
			'Launch your website with a header that combines strong visual identity and functional navigation. Our header patterns establish your site’s character and ensure your visitors can easily explore from desktop and mobile devices.',
			{ comment: 'Intro text on the Pattern Library "Headers" category page' }
		),
	},
	footer: {
		title: translate( 'Footer WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Footers" category page',
		} ),
		metaDescription: translate(
			'Build a strong foundation with patterns. Choose from our collection of patterns to add essential information and navigation to the footer of your site.',
			{ comment: 'SEO meta description for the Pattern Library "Footers" category page' }
		),
		patternsHeading: translate( 'Footer Patterns', {
			comment: 'Heading of the Pattern Library "Footers" category page',
		} ),
		patternsDescription: translate(
			'Build your website’s foundation with footer patterns designed to incorporate key information and straightforward navigation. Our patterns help enrich this often-overlooked area, enhancing usability and site architecture.',
			{ comment: 'Intro text on the Pattern Library "Footers" category page' }
		),
	},
	about: {
		title: translate( 'About WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "About" category page',
		} ),
		metaDescription: translate(
			'Tell your story with patterns. Add one of these patterns to your site to convey your mission and values compellingly.',
			{ comment: 'SEO meta description for the Pattern Library "About" category page' }
		),
		patternsHeading: translate( 'About Patterns', {
			comment: 'Heading of the Pattern Library "About" category page',
		} ),
		patternsDescription: translate(
			'Tell your brand’s story and success with patterns that resonate. These patterns help communicate your mission and values through compelling visual statements, building a deeper connection with your audience.',
			{ comment: 'Intro text on the Pattern Library "About" category page' }
		),
		layoutsMetaDescription: translate(
			'Tell your story with layouts. Add one of these full-page patterns to your site to convey your mission and values compellingly.',
			{
				comment:
					'SEO meta description for the Pattern Library "About" category page for full-page patterns',
			}
		),
		layoutsHeading: translate( 'About Layouts', {
			comment: 'Heading of the Pattern Library "About" category page for full-page patterns',
		} ),
		layoutsDescription: translate(
			'Share your brand’s narrative with layouts that tell a story. These full-page patterns are designed to articulate your brand ethos and values, crafting a compelling brand identity that resonates with visitors.',
			{
				comment: 'Intro text on the Pattern Library "Headers" category page for full-page patterns',
			}
		),
	},
	posts: {
		title: translate( 'Blog Posts WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Blog Posts" category page',
		} ),
		metaDescription: translate(
			'Get more readers with patterns. Take advantage of this selection of patterns to display your latest blog posts, keeping readers engaged',
			{ comment: 'SEO meta description for the Pattern Library "Blog Posts" category page' }
		),
		patternsHeading: translate( 'Blog Posts Patterns', {
			comment: 'Heading of the Pattern Library "Blog Posts" category page',
		} ),
		patternsDescription: translate(
			'Keep readers engaged with patterns designed to bring your content to life. These designs automatically display your latest blog posts, adding depth and visual appeal to your site.',
			{ comment: 'Intro text on the Pattern Library "Blog Posts" category page' }
		),
		layoutsMetaDescription: translate(
			'Get more readers with layouts. Take advantage of this selection of full-page patterns to display your latest blog posts, keeping readers engaged',
			{
				comment:
					'SEO meta description for the Pattern Library "Blog Posts" category page for full-page patterns',
			}
		),
		layoutsHeading: translate( 'Blog Posts Layouts', {
			comment: 'Heading of the Pattern Library "Blog Posts" category page for full-page patterns',
		} ),
		layoutsDescription: translate(
			'Enhance your blog’s appeal with visual layouts that bring your site’s content to the forefront. Designed to keep readers hooked, our full-page patterns add an extra layer of professionalism and engagement to your posts.',
			{
				comment:
					'Intro text on the Pattern Library "Blog Posts" category page for full-page patterns',
			}
		),
	},
	contact: {
		title: translate( 'Contact WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Contact" category page',
		} ),
		metaDescription: translate(
			'Connect with your audience using patterns. Pick from this set of patterns to add a contact form and a map to your site.',
			{ comment: 'SEO meta description for the Pattern Library "Contact" category page' }
		),
		patternsHeading: translate( 'Contact Patterns', {
			comment: 'Heading of the Pattern Library "Contact" category page',
		} ),
		patternsDescription: translate(
			'Connect with your audience using patterns. Choose from designs that integrate a contact form and interactive map, facilitating communication and location finding for your visitors.',
			{ comment: 'Intro text on the Pattern Library "Contact" category page' }
		),
		layoutsMetaDescription: translate(
			'Connect with your audience using layouts. Pick from this set of full-page patterns to add a contact form and a map to your site.',
			{
				comment:
					'SEO meta description for the Pattern Library "Blog Posts" category page for full-page patterns',
			}
		),
		layoutsHeading: translate( 'Contact Layouts', {
			comment: 'Heading of the Pattern Library "Contact" category page for full-page patterns',
		} ),
		layoutsDescription: translate(
			'Craft a user-friendly interface with our contact layouts. With thoughtfully integrated contact forms and maps, these full-page patterns are designed to make it effortless for users to contact you.',
			{
				comment: 'Intro text on the Pattern Library "Contact" category page for full-page patterns',
			}
		),
	},
	events: {
		title: translate( 'Events WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Events" category page',
		} ),
		metaDescription: translate(
			'Promote your events with patterns. Highlight upcoming events on your site with patterns that grab attention and inform.',
			{ comment: 'SEO meta description for the Pattern Library "Events" category page' }
		),
		patternsHeading: translate( 'Event Patterns', {
			comment: 'Heading of the Pattern Library "Events" category page',
		} ),
		patternsDescription: translate(
			'Enhance your event promotion with dynamic patterns designed to spotlight your upcoming events. These patterns capture attention and effectively deliver essential event information.',
			{ comment: 'Intro text on the Pattern Library "Events" category page' }
		),
	},
	gallery: {
		title: translate( 'Gallery WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Gallery" category page',
		} ),
		metaDescription: translate(
			'Stunning galleries with patterns. Pick from our set of patterns to showcase your photos in galleries and slideshows.',
			{ comment: 'SEO meta description for the Pattern Library "Gallery" category page' }
		),
		patternsHeading: translate( 'Gallery Patterns', {
			comment: 'Heading of the Pattern Library "Gallery" category page',
		} ),
		patternsDescription: translate(
			'Our gallery patterns offer an elegant framework for presenting your artwork and photos. Choose from a curated selection to exhibit your media in a stylish way, ensuring your visuals are both striking and organized.',
			{ comment: 'Intro text on the Pattern Library "Gallery" category page' }
		),
		layoutsMetaDescription: translate(
			'Stunning galleries with layouts. Pick from our set of full-page patterns to showcase your photos in galleries and slideshows.',
			{
				comment:
					'SEO meta description for the Pattern Library "Gallery" category page for full-page patterns',
			}
		),
		layoutsHeading: translate( 'Gallery Layouts', {
			comment: 'Heading of the Pattern Library "Gallery" category page for full-page patterns',
		} ),
		layoutsDescription: translate(
			'Display your visuals with grace using our gallery layouts. Carefully selected for their aesthetic appeal, these full-page patterns provide an organized yet striking showcase for your photos or artwork.',
			{
				comment: 'Intro text on the Pattern Library "Gallery" category page for full-page patterns',
			}
		),
	},
	intro: {
		title: translate( 'Intro WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Intro" category page',
		} ),
		metaDescription: translate(
			'Captivating introductions with patterns. Make a good first impression with patterns that welcome visitors and guide them through your site.',
			{ comment: 'SEO meta description for the Pattern Library "Intro" category page' }
		),
		patternsHeading: translate( 'Intro Patterns', {
			comment: 'Heading of the Pattern Library "Intro" category page',
		} ),
		patternsDescription: translate(
			'Make a great first impression on your visitors with patterns that establish a warm and welcoming introduction. Our intro patterns gracefully lead visitors through your site, maximizing your impact.',
			{ comment: 'Intro text on the Pattern Library "Intro" category page' }
		),
	},
	menu: {
		title: translate( 'Menu WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Menu" (restaurant menus) category page',
		} ),
		metaDescription: translate(
			'Craft delightful menus with patterns. Start your restaurant website with beautifully designed patterns that make your menus stand out.',
			{
				comment:
					'SEO meta description for the Pattern Library "Menu" (restaurant menus) category page',
			}
		),
		patternsHeading: translate( 'Restaurant Menu Patterns', {
			comment: 'Heading of the Pattern Library "Menu" (restaurant menus) category page',
		} ),
		patternsDescription: translate(
			'Begin your restaurant’s online presence with bespoke menu patterns that entice and delight. These menu patterns elevate your offerings into a visual feast that complements your dishes.',
			{ comment: 'Intro text on the Pattern Library "Menu" (restaurant menus) category page' }
		),
		layoutsMetaDescription: translate(
			'Craft delightful menus with layouts. Start your restaurant website with beautifully designed full-page patterns that make your menus stand out.',
			{
				comment:
					'SEO meta description for the Pattern Library "Menu" (restaurant menus) category page for full-page patterns',
			}
		),
		layoutsHeading: translate( 'Restaurant Menu Layouts', {
			comment:
				'Heading of the Pattern Library "Menu" (restaurant menus) category page for full-page patterns',
		} ),
		layoutsDescription: translate(
			'Introduce your restaurant’s menu with layouts that tantalize the senses. Our full-page pattern designs complement your cuisine and set the stage for a memorable dining experience, even online.',
			{
				comment:
					'Intro text on the Pattern Library "Menu" (restaurant menus) category page for full-page patterns',
			}
		),
	},
	newsletter: {
		title: translate( 'Newsletter WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Newsletter" category page',
		} ),
		metaDescription: translate(
			'Expand your audience with patterns. Collect emails on your site via one of those newsletter patterns, and build a subscribers list that you can reach to.',
			{ comment: 'SEO meta description for the Pattern Library "Newsletter" category page' }
		),
		patternsHeading: translate( 'Newsletter Patterns', {
			comment: 'Heading of the Pattern Library "Newsletter" category page',
		} ),
		patternsDescription: translate(
			'Grow your subscriber base with patterns designed for conversion. Our newsletter patterns simplify email collection and amplify audience growth, providing a direct line to engage with your followers.',
			{ comment: 'Intro text on the Pattern Library "Newsletter" category page' }
		),
	},
	services: {
		title: translate( 'Services WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Services" category page',
		} ),
		metaDescription: translate(
			'Showcase services with patterns. Help potential clients understand and engage with your services by adding one of those patterns to your site.',
			{ comment: 'SEO meta description for the Pattern Library "Services" category page' }
		),
		patternsHeading: translate( 'Services Patterns', {
			comment: 'Heading of the Pattern Library "Services" category page',
		} ),
		patternsDescription: translate(
			'Present your services with designs that engage. Each pattern is crafted to help potential clients grasp the essence of your offerings, encouraging interaction and interest in your services.',
			{ comment: 'Intro text on the Pattern Library "Services" category page' }
		),
		layoutsMetaDescription: translate(
			'Showcase services with layouts. Help potential clients understand and engage with your services by adding one of those full-page patterns to your site.',
			{
				comment:
					'SEO meta description for the Pattern Library "Services" category page for full-page patterns',
			}
		),
		layoutsHeading: translate( 'Services Layouts', {
			comment: 'Heading of the Pattern Library "Services" category page for full-page patterns',
		} ),
		layoutsDescription: translate(
			'Communicate the value of your services with layouts that clarify and captivate. These full-page patterns enhance potential clients’ perception and interaction with your offerings.',
			{
				comment:
					'Intro text on the Pattern Library "Services" category page for full-page patterns',
			}
		),
	},
	store: {
		title: translate( 'Store WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Store" category page',
		} ),
		metaDescription: translate(
			'Start selling with patterns. Convert your site to an online store with this set of patterns that can be used to showcase your products.',
			{ comment: 'SEO meta description for the Pattern Library "Store" category page' }
		),
		patternsHeading: translate( 'Store Patterns', {
			comment: 'Heading of the Pattern Library "Store" category page',
		} ),
		patternsDescription: translate(
			'Enhance your site with store patterns that simplify the display of your products. These patterns are designed to entice visitors to browse and purchase with confidence from your affiliated online store.',
			{ comment: 'Intro text on the Pattern Library "Store" category page' }
		),
		layoutsMetaDescription: translate(
			'Start selling with layouts. Convert your site to an online store with this set of full-page patterns that can be used to showcase your products.',
			{
				comment:
					'SEO meta description for the Pattern Library "Store" category page for full-page patterns',
			}
		),
		layoutsHeading: translate( 'Store Layouts', {
			comment: 'Heading of the Pattern Library "Store" category page for full-page patterns',
		} ),
		layoutsDescription: translate(
			'Our store layouts are designed to streamline the online shopping experience. These full-page patterns display your products in an inviting manner, simplifying the path from discovery to purchase.',
			{ comment: 'Intro text on the Pattern Library "Store" category page for full-page patterns' }
		),
	},
	testimonials: {
		title: translate( 'Testimonial WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Testimonials" category page',
		} ),
		metaDescription: translate(
			'Build trust with patterns. Leverage our set of patterns to showcase customer satisfaction on your site, and enhance trust in your brand or services.',
			{ comment: 'SEO meta description for the Pattern Library "Testimonials" category page' }
		),
		patternsHeading: translate( 'Testimonials Patterns', {
			comment: 'Heading of the Pattern Library "Testimonials" category page',
		} ),
		patternsDescription: translate(
			'Build customer trust with patterns that spotlight satisfaction. Our patterns present client testimonials to help you amplify credibility and reinforce brand loyalty.',
			{ comment: 'Intro text on the Pattern Library "Testimonials" category page' }
		),
	},
};

export const PatternsHeader = () => {
	const { category, patternTypeFilter } = usePatternsContext();

	const categoryConfig = CONTENT[ category ];
	const { title } = categoryConfig || CONTENT.default;

	let heading: Substitution = CONTENT.default.patternsHeading;
	let description: Substitution = CONTENT.default.patternsDescription;
	let metaDescription: Substitution = CONTENT.default.patternsDescription;

	if ( categoryConfig ) {
		if ( patternTypeFilter === PatternTypeFilter.REGULAR ) {
			heading = categoryConfig.patternsHeading;
			description = categoryConfig.patternsDescription;
			metaDescription = categoryConfig.metaDescription;
		} else if (
			patternTypeFilter === PatternTypeFilter.PAGES &&
			'layoutsHeading' in categoryConfig
		) {
			heading = categoryConfig.layoutsHeading;
			description = categoryConfig.layoutsDescription;
			metaDescription = categoryConfig.layoutsMetaDescription;
		}
	}

	const metas = [ { name: 'description', content: metaDescription } ];

	return (
		<>
			<DocumentHead title={ title } meta={ metas } />

			<header className="patterns-header">
				<div className="patterns-header__inner">
					<h1>{ heading }</h1>

					<div className="patterns-header__description">{ preventWidows( description ) }</div>

					<div className="patterns-header__search-input">
						<PatternsSearchField />
					</div>
				</div>
			</header>
		</>
	);
};
