import { Substitution, translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { preventWidows } from 'calypso/lib/formatting';
import { PatternsSearchField } from 'calypso/my-sites/patterns/components/search-field';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { PatternTypeFilter, type Category } from 'calypso/my-sites/patterns/types';

import './style.scss';

type ContentEntryRegular = {
	title: Substitution;
	patternsHeading: Substitution;
	patternsDescription: Substitution;
};

type ContentEntryLayouts = ContentEntryRegular & {
	layoutsHeading: Substitution;
	layoutsDescription: Substitution;
};

type ContentEntry = ContentEntryRegular | ContentEntryLayouts;

const CONTENT: Record< Category[ 'name' ], ContentEntry > = {
	default: {
		title: translate( 'WordPress Patterns', {
			comment: 'HTML title of the Pattern Library home page',
		} ),
		patternsHeading: translate( "It's easier with patterns", {
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
		patternsHeading: translate( 'About Patterns', {
			comment: 'Heading of the Pattern Library "About" category page',
		} ),
		patternsDescription: translate(
			'Tell your brand’s story and success with patterns that resonate. These patterns help communicate your mission and values through compelling visual statements, building a deeper connection with your audience.',
			{ comment: 'Intro text on the Pattern Library "About" category page' }
		),
		layoutsHeading: translate( 'About Layouts', {
			comment: 'Heading of the Pattern Library "About" category page',
		} ),
		layoutsDescription: translate(
			'Share your brand’s narrative with layouts that tell a story. These layouts are designed to articulate your brand ethos and values, crafting a compelling brand identity that resonates with visitors.',
			{ comment: 'Intro text on the Pattern Library "Headers" category page' }
		),
	},
	posts: {
		title: translate( 'Blog Posts WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Blog Posts" category page',
		} ),
		patternsHeading: translate( 'Blog Posts Patterns', {
			comment: 'Heading of the Pattern Library "Blog Posts" category page',
		} ),
		patternsDescription: translate(
			'Keep readers engaged with patterns designed to bring your content to life. These designs automatically display your latest blog posts, adding depth and visual appeal to your site.',
			{ comment: 'Intro text on the Pattern Library "Blog Posts" category page' }
		),
		layoutsHeading: translate( 'Blog Posts Layouts', {
			comment: 'Heading of the Pattern Library "Blog Posts" category page',
		} ),
		layoutsDescription: translate(
			'Enhance your blog’s appeal with visual layouts that bring your site’s content to the forefront. Designed to keep readers hooked, our layouts add an extra layer of professionalism and engagement to your posts.',
			{ comment: 'Intro text on the Pattern Library "Blog Posts" category page' }
		),
	},
	contact: {
		title: translate( 'Contact WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Contact" category page',
		} ),
		patternsHeading: translate( 'Contact Patterns', {
			comment: 'Heading of the Pattern Library "Contact" category page',
		} ),
		patternsDescription: translate(
			'Connect with your audience using patterns. Choose from designs that integrate a contact form and interactive map, facilitating communication and location finding for your visitors.',
			{ comment: 'Intro text on the Pattern Library "Contact" category page' }
		),
		layoutsHeading: translate( 'Contact Layouts', {
			comment: 'Heading of the Pattern Library "Contact" category page',
		} ),
		layoutsDescription: translate(
			'Craft a user-friendly interface with our contact layouts. With thoughtfully integrated contact forms and maps, these layouts are designed to make it effortless for users to contact you.',
			{ comment: 'Intro text on the Pattern Library "Contact" category page' }
		),
	},
	events: {
		title: translate( 'Events WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Events" category page',
		} ),
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
		patternsHeading: translate( 'Gallery Patterns', {
			comment: 'Heading of the Pattern Library "Gallery" category page',
		} ),
		patternsDescription: translate(
			'Our gallery patterns offer an elegant framework for presenting your artwork and photos. Choose from a curated selection to exhibit your media in a stylish way, ensuring your visuals are both striking and organized.',
			{ comment: 'Intro text on the Pattern Library "Gallery" category page' }
		),
		layoutsHeading: translate( 'Gallery Layouts', {
			comment: 'Heading of the Pattern Library "Gallery" category page',
		} ),
		layoutsDescription: translate(
			'Display your visuals with grace using our gallery layouts. Carefully selected for their aesthetic appeal, they provide an organized yet striking showcase for your photos or artwork.',
			{ comment: 'Intro text on the Pattern Library "Gallery" category page' }
		),
	},
	intro: {
		title: translate( 'Intro WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Intro" category page',
		} ),
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
		patternsHeading: translate( 'Restaurant Menu Patterns', {
			comment: 'Heading of the Pattern Library "Menu" (restaurant menus) category page',
		} ),
		patternsDescription: translate(
			'Begin your restaurant’s online presence with bespoke menu patterns that entice and delight. These menu patterns elevate your offerings into a visual feast that complements your dishes.',
			{ comment: 'Intro text on the Pattern Library "Menu" (restaurant menus) category page' }
		),
		layoutsHeading: translate( 'Restaurant Menu Layouts', {
			comment: 'Heading of the Pattern Library "Menu" (restaurant menus) category page',
		} ),
		layoutsDescription: translate(
			'Introduce your restaurant’s menu with layouts that tantalize the senses. Crafted for distinction, our designs complement your cuisine and set the stage for a memorable dining experience, even online.',
			{ comment: 'Intro text on the Pattern Library "Menu" (restaurant menus) category page' }
		),
	},
	newsletter: {
		title: translate( 'Newsletter WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Newsletter" category page',
		} ),
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
		patternsHeading: translate( 'Services Patterns', {
			comment: 'Heading of the Pattern Library "Services" category page',
		} ),
		patternsDescription: translate(
			'Present your services with designs that engage. Each pattern is crafted to help potential clients grasp the essence of your offerings, encouraging interaction and interest in your services.',
			{ comment: 'Intro text on the Pattern Library "Services" category page' }
		),
		layoutsHeading: translate( 'Services Layouts', {
			comment: 'Heading of the Pattern Library "Services" category page',
		} ),
		layoutsDescription: translate(
			'Communicate the value of your services with layouts that clarify and captivate. These layouts enhance potential clients’ perception and interaction with your offerings.',
			{ comment: 'Intro text on the Pattern Library "Services" category page' }
		),
	},
	store: {
		title: translate( 'Store WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Store" category page',
		} ),
		patternsHeading: translate( 'Store Patterns', {
			comment: 'Heading of the Pattern Library "Store" category page',
		} ),
		patternsDescription: translate(
			'Enhance your site with store patterns that simplify the display of your products. These patterns are designed to entice visitors to browse and purchase with confidence from your affiliated online store.',
			{ comment: 'Intro text on the Pattern Library "Store" category page' }
		),
		layoutsHeading: translate( 'Store Layouts', {
			comment: 'Heading of the Pattern Library "Store" category page',
		} ),
		layoutsDescription: translate(
			'Our store layouts are designed to streamline the online shopping experience. These layouts display your products in an inviting manner, simplifying the path from discovery to purchase.',
			{ comment: 'Intro text on the Pattern Library "Store" category page' }
		),
	},
	testimonials: {
		title: translate( 'Testimonial WordPress Patterns', {
			comment: 'HTML title of the Pattern Library "Testimonials" category page',
		} ),
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

	if ( categoryConfig ) {
		if ( patternTypeFilter === PatternTypeFilter.REGULAR ) {
			heading = categoryConfig.patternsHeading;
			description = categoryConfig.patternsDescription;
		} else if (
			patternTypeFilter === PatternTypeFilter.PAGES &&
			'layoutsHeading' in categoryConfig
		) {
			heading = categoryConfig.layoutsHeading;
			description = categoryConfig.layoutsDescription;
		}
	}

	const metas = [ { name: 'description', content: description } ];

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
