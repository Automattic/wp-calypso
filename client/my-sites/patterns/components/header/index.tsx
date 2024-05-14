import { Substitution, useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { preventWidows } from 'calypso/lib/formatting';
import ogImage from 'calypso/my-sites/patterns/components/header/images/og-image.png';
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

export const PatternsHeader = () => {
	const { category, patternTypeFilter } = usePatternsContext();
	const translate = useTranslate();

	const CONTENT: Record< Category[ 'name' ], ContentEntry > = {
		default: {
			title: translate( 'WordPress Patterns', {
				comment: 'HTML title of the Pattern Library home page',
			} ),
			metaDescription: translate(
				'Dive into hundreds of expertly designed, fully responsive layouts, and bring any kind of site to life, faster.',
				{ comment: 'Intro text on the Pattern Library home page' }
			),
			patternsHeading: translate( 'Build Faster with Patterns', {
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
				'Get a head start with patterns. Craft a beautiful menu and header for your site with patterns to catch your visitors’ attention.',
				{ comment: 'SEO meta description for the Pattern Library "Headers" category page' }
			),
			patternsHeading: translate( 'Header Patterns', {
				comment: 'Heading of the Pattern Library "Headers" category page',
			} ),
			patternsDescription: translate(
				'Launch your website with a header that combines strong visual identity and functional navigation. Our header patterns establish your site’s character and make sure your visitors can easily explore your content from desktop and mobile devices.',
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
				'Build your website’s foundation with footer patterns designed to display key information. Our patterns help make this often-overlooked area more visible, for better navigation.',
				{ comment: 'Intro text on the Pattern Library "Footers" category page' }
			),
		},
		about: {
			title: translate( 'About WordPress Patterns', {
				comment: 'HTML title of the Pattern Library "About" category page',
			} ),
			metaDescription: translate(
				'Tell your story with patterns. Add an about page or section to beautifully showcase your goals, ideas, and any other details you’d like to share.',
				{ comment: 'SEO meta description for the Pattern Library "About" category page' }
			),
			patternsHeading: translate( 'About Patterns', {
				comment: 'Heading of the Pattern Library "About" category page',
			} ),
			patternsDescription: translate(
				'Tell your brand’s story with patterns designed to communicate your mission and values visually, building a deeper connection with your audience.',
				{ comment: 'Intro text on the Pattern Library "About" category page' }
			),
			layoutsMetaDescription: translate(
				'Tell your story with layouts. Add a full-page pattern to your site to showcase your mission and values in their best light.',
				{
					comment:
						'SEO meta description for the Pattern Library "About" category page for full-page patterns',
				}
			),
			layoutsHeading: translate( 'About Layouts', {
				comment: 'Heading of the Pattern Library "About" category page for full-page patterns',
			} ),
			layoutsDescription: translate(
				'Share your brand’s narrative with layouts that tell a story. These full-page patterns are designed to articulate your brand ethos and values, creating a compelling brand identity that resonates with your visitors.',
				{
					comment: 'Intro text on the Pattern Library "About" category page for full-page patterns',
				}
			),
		},
		posts: {
			title: translate( 'Blog Posts WordPress Patterns', {
				comment: 'HTML title of the Pattern Library "Blog Posts" category page',
			} ),
			metaDescription: translate(
				'Get more readers with patterns. Take advantage of this set of patterns to make your writing pop, keep readers engaged, and turn casual visitors into supporters.',
				{ comment: 'SEO meta description for the Pattern Library "Blog Posts" category page' }
			),
			patternsHeading: translate( 'Blog Posts Patterns', {
				comment: 'Heading of the Pattern Library "Blog Posts" category page',
			} ),
			patternsDescription: translate(
				'Keep readers engaged with patterns designed to bring your content to life. Display your latest blog posts with a beautiful design that adds both depth and visual appeal to your site.',
				{ comment: 'Intro text on the Pattern Library "Blog Posts" category page' }
			),
			layoutsMetaDescription: translate(
				'Get more readers with layouts. Pick a full-page pattern designed to make your writing pop, keep readers engaged, and turn casual visitors into supporters.',
				{
					comment:
						'SEO meta description for the Pattern Library "Blog Posts" category page for full-page patterns',
				}
			),
			layoutsHeading: translate( 'Blog Posts Layouts', {
				comment: 'Heading of the Pattern Library "Blog Posts" category page for full-page patterns',
			} ),
			layoutsDescription: translate(
				'Take your blog’s appeal to the next level with visual layouts that display your latest blog posts. Designed to keep readers hooked, our full-page patterns add an extra layer of professionalism to your site.',
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
				'Connect with your audience using patterns. Choose from designs that integrate a contact form and interactive map, making finding and getting in touch with you easier for your visitors.',
				{ comment: 'Intro text on the Pattern Library "Contact" category page' }
			),
			layoutsMetaDescription: translate(
				'Connect with your audience using layouts. Pick from this set of full-page patterns to add a contact form and a map to your site.',
				{
					comment:
						'SEO meta description for the Pattern Library "Contact" category page for full-page patterns',
				}
			),
			layoutsHeading: translate( 'Contact Layouts', {
				comment: 'Heading of the Pattern Library "Contact" category page for full-page patterns',
			} ),
			layoutsDescription: translate(
				'Craft a user-friendly interface with our contact layouts. With thoughtfully integrated contact forms and maps, these full-page patterns are designed to make communication and location finding easier for your visitors.',
				{
					comment:
						'Intro text on the Pattern Library "Contact" category page for full-page patterns',
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
			patternsHeading: translate( 'Events Patterns', {
				comment: 'Heading of the Pattern Library "Events" category page',
			} ),
			patternsDescription: translate(
				'Enhance your event promotion with dynamic patterns designed to spotlight your upcoming events. Capture attention while effectively delivering essential event information.',
				{ comment: 'Intro text on the Pattern Library "Events" category page' }
			),
		},
		gallery: {
			title: translate( 'Gallery WordPress Patterns', {
				comment: 'HTML title of the Pattern Library "Gallery" category page',
			} ),
			metaDescription: translate(
				'Stunning galleries with patterns. Pick from our set of gallery patterns to showcase images with elegance.',
				{ comment: 'SEO meta description for the Pattern Library "Gallery" category page' }
			),
			patternsHeading: translate( 'Gallery Patterns', {
				comment: 'Heading of the Pattern Library "Gallery" category page',
			} ),
			patternsDescription: translate(
				'Our gallery patterns offer an elegant frame for all your art and photos. Choose from a curated selection of designs to show off your media stylishly—ensuring your visuals are both striking and organized.',
				{ comment: 'Intro text on the Pattern Library "Gallery" category page' }
			),
			layoutsMetaDescription: translate(
				'Stunning galleries with layouts. Pick from our set of full-page gallery patterns to showcase images with elegance.',
				{
					comment:
						'SEO meta description for the Pattern Library "Gallery" category page for full-page patterns',
				}
			),
			layoutsHeading: translate( 'Gallery Layouts', {
				comment: 'Heading of the Pattern Library "Gallery" category page for full-page patterns',
			} ),
			layoutsDescription: translate(
				'Display your visuals with elegance with our gallery layouts. Carefully selected for their aesthetic appeal, these full-page patterns provide an organized yet striking showcase for your photos or artwork.',
				{
					comment:
						'Intro text on the Pattern Library "Gallery" category page for full-page patterns',
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
				'Start your restaurant website with beautifully designed patterns designed to put the spotlight on your menu.',
				{
					comment:
						'SEO meta description for the Pattern Library "Menu" (restaurant menus) category page',
				}
			),
			patternsHeading: translate( 'Restaurant Menu Patterns', {
				comment: 'Heading of the Pattern Library "Menu" (restaurant menus) category page',
			} ),
			patternsDescription: translate(
				'Put your restaurant’s menu at the center of your online presence with patterns designed to entice and delight. Elevate your offerings into a visual feast that complements your dishes.',
				{ comment: 'Intro text on the Pattern Library "Menu" (restaurant menus) category page' }
			),
			layoutsMetaDescription: translate(
				'Craft delightful menus with layouts. Start your restaurant website with beautifully designed full-page patterns designed to make your menu stand out.',
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
				'Introduce your restaurant’s menu with layouts that captivate the senses. Our full-page pattern designs complement your cuisine and set the stage for a memorable dining experience, even online.',
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
				'Collect emails from landing pages on your site with one of these compelling newsletter patterns—the ideal way to grow and reach out to a list of subscribers.',
				{ comment: 'SEO meta description for the Pattern Library "Newsletter" category page' }
			),
			patternsHeading: translate( 'Newsletter Patterns', {
				comment: 'Heading of the Pattern Library "Newsletter" category page',
			} ),
			patternsDescription: translate(
				'Grow your subscriber base with patterns designed for conversion. Our newsletter patterns simplify email collection and make audience growth easier, providing a direct line to engage with your followers.',
				{ comment: 'Intro text on the Pattern Library "Newsletter" category page' }
			),
		},
		services: {
			title: translate( 'Services WordPress Patterns', {
				comment: 'HTML title of the Pattern Library "Services" category page',
			} ),
			metaDescription: translate(
				'Showcase services with patterns. Help potential clients understand and engage with your services by adding a services pattern to your site.',
				{ comment: 'SEO meta description for the Pattern Library "Services" category page' }
			),
			patternsHeading: translate( 'Services Patterns', {
				comment: 'Heading of the Pattern Library "Services" category page',
			} ),
			patternsDescription: translate(
				'Present your services with designs that engage. Each pattern is crafted to help potential clients easily understand your offerings, encouraging interaction and building interest in your services.',
				{ comment: 'Intro text on the Pattern Library "Services" category page' }
			),
			layoutsMetaDescription: translate(
				'Showcase services with layouts. Help potential clients understand and engage with your services by adding a services layout to your site.',
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
				'Start selling with patterns. Showcase relevant information about your store and products with this set of patterns.',
				{ comment: 'SEO meta description for the Pattern Library "Store" category page' }
			),
			patternsHeading: translate( 'Store Patterns', {
				comment: 'Heading of the Pattern Library "Store" category page',
			} ),
			patternsDescription: translate(
				'Give your site the clean, browsable look and feel of an online store with patterns designed to showcase and promote your products.',
				{ comment: 'Intro text on the Pattern Library "Store" category page' }
			),
			layoutsMetaDescription: translate(
				'Start selling with layouts. Turn your site into an online store with this set of full-page patterns that can be used to showcase your products.',
				{
					comment:
						'SEO meta description for the Pattern Library "Store" category page for full-page patterns',
				}
			),
			layoutsHeading: translate( 'Store Layouts', {
				comment: 'Heading of the Pattern Library "Store" category page for full-page patterns',
			} ),
			layoutsDescription: translate(
				'Our store layouts are designed to give your site the look and feel of an online store. These full-page patterns display your products in an inviting way, simplifying the path from discovery to purchase.',
				{
					comment: 'Intro text on the Pattern Library "Store" category page for full-page patterns',
				}
			),
		},
		testimonials: {
			title: translate( 'Testimonial WordPress Patterns', {
				comment: 'HTML title of the Pattern Library "Testimonials" category page',
			} ),
			metaDescription: translate(
				'Build trust with patterns. Pick from a range of patterns designed to showcase customer satisfaction and inspire trust in your brand or services.',
				{ comment: 'SEO meta description for the Pattern Library "Testimonials" category page' }
			),
			patternsHeading: translate( 'Testimonials Patterns', {
				comment: 'Heading of the Pattern Library "Testimonials" category page',
			} ),
			patternsDescription: translate(
				'Build customer trust with patterns that spotlight satisfaction through client testimonials that help you amplify credibility and reinforce brand loyalty.',
				{ comment: 'Intro text on the Pattern Library "Testimonials" category page' }
			),
		},
	};

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

	const metas = [
		{ name: 'description', content: metaDescription },
		{ property: 'og:image', content: `https://wordpress.com${ ogImage }` },
	];

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
