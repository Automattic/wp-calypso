import { Substitution, translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { preventWidows } from 'calypso/lib/formatting';
import { PatternsSearchField } from 'calypso/my-sites/patterns/components/search-field';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import type { Category } from 'calypso/my-sites/patterns/types';

import './style.scss';

const CONTENT: Record<
	Category[ 'name' ],
	{ description: Substitution; heading: Substitution; title: Substitution }
> = {
	default: {
		title: translate( 'WordPress Patterns', {
			comment: 'HTML title of the Pattern Library home page',
		} ),
		heading: translate( "It's easier with patterns", {
			comment: 'Heading of the Pattern Library home page',
		} ),
		description: translate(
			'Dive into hundreds of expertly designed, fully responsive layouts, and bring any kind of site to life, faster.',
			{ comment: 'Intro text on the Pattern Library home page' }
		),
	},
	header: {
		title: translate( 'WordPress Header Patterns', {
			comment: 'HTML title of the Pattern Library "Headers" category page',
		} ),
		heading: translate( 'Header Patterns', {
			comment: 'Heading of the Pattern Library "Headers" category page',
		} ),
		description: translate(
			'Launch your website with a header that combines strong visual identity and functional navigation. Our header patterns draw the eye and establish your site’s character, all while ensuring your visitors can explore with ease from desktop and mobile devices.',
			{ comment: 'Intro text on the Pattern Library "Headers" category page' }
		),
	},
	footer: {
		title: translate( 'WordPress Footer Patterns', {
			comment: 'HTML title of the Pattern Library "Footers" category page',
		} ),
		heading: translate( 'Footer Patterns', {
			comment: 'Heading of the Pattern Library "Footers" category page',
		} ),
		description: translate(
			'Build your website’s foundation with footer patterns designed to incorporate key information and straightforward navigation. Our patterns help enrich this often-overlooked area, enhancing usability and site architecture.',
			{ comment: 'Intro text on the Pattern Library "Footers" category page' }
		),
	},
	about: {
		title: translate( 'WordPress About Patterns', {
			comment: 'HTML title of the Pattern Library "About" category page',
		} ),
		heading: translate( 'About Patterns', {
			comment: 'Heading of the Pattern Library "About" category page',
		} ),
		description: translate(
			'Tell your brand’s story and success with patterns that resonate. Incorporating these patterns can transform your mission and values into compelling visual statements, building a deeper connection with your audience.',
			{ comment: 'Intro text on the Pattern Library "About" category page' }
		),
	},
	posts: {
		title: translate( 'WordPress Blog Posts Patterns', {
			comment: 'HTML title of the Pattern Library "Blog Posts" category page',
		} ),
		heading: translate( 'Blog Posts Patterns', {
			comment: 'Heading of the Pattern Library "Blog Posts" category page',
		} ),
		description: translate(
			'Elevate your blog’s visual appeal and readability with patterns engineered to bring your content to life. These designs bolster reader retention and stimulate engagement by adding visual depth to your writing.',
			{ comment: 'Intro text on the Pattern Library "Blog Posts" category page' }
		),
	},
	contact: {
		title: translate( 'WordPress Contact Patterns', {
			comment: 'HTML title of the Pattern Library "Contact" category page',
		} ),
		heading: translate( 'Contact Patterns', {
			comment: 'Heading of the Pattern Library "Contact" category page',
		} ),
		description: translate(
			'Connect with your audience using patterns. Choose from designs that integrate a contact form and interactive map, facilitating communication and location finding for your visitors.',
			{ comment: 'Intro text on the Pattern Library "Contact" category page' }
		),
	},
	events: {
		title: translate( 'WordPress Events Patterns', {
			comment: 'HTML title of the Pattern Library "Events" category page',
		} ),
		heading: translate( 'Event Patterns', {
			comment: 'Heading of the Pattern Library "Events" category page',
		} ),
		description: translate(
			'Enhance your event promotion with dynamic patterns designed to spotlight your upcoming events. These patterns capture attention and effectively deliver essential event information.',
			{ comment: 'Intro text on the Pattern Library "Events" category page' }
		),
	},
	gallery: {
		title: translate( 'WordPress Gallery Patterns', {
			comment: 'HTML title of the Pattern Library "Gallery" category page',
		} ),
		heading: translate( 'Gallery Patterns', {
			comment: 'Heading of the Pattern Library "Gallery" category page',
		} ),
		description: translate(
			'Our gallery patterns offer an elegant framework for presenting your artwork and photographs. Choose from a curated selection to exhibit your media with a sophisticated touch, ensuring your visuals are as striking as they are organized.',
			{ comment: 'Intro text on the Pattern Library "Gallery" category page' }
		),
	},
	intro: {
		title: translate( 'WordPress Intro Patterns', {
			comment: 'HTML title of the Pattern Library "Intro" category page',
		} ),
		heading: translate( 'Intro Patterns', {
			comment: 'Heading of the Pattern Library "Intro" category page',
		} ),
		description: translate(
			'Establish a warm welcome with patterns that make every first click count. Our intro patterns gracefully lead visitors through your site, ensuring an impactful first impression.',
			{ comment: 'Intro text on the Pattern Library "Intro" category page' }
		),
	},
	menu: {
		title: translate( 'WordPress Menu Patterns', {
			comment: 'HTML title of the Pattern Library "Menu" (restaurant menus) category page',
		} ),
		heading: translate( 'Restaurant Menu Patterns', {
			comment: 'Heading of the Pattern Library "Menu" (restaurant menus) category page',
		} ),
		description: translate(
			'Begin your restaurant’s online presence with bespoke menu patterns that entice and delight. These menu patterns elevate your offerings into a visual feast that complements your dishes.',
			{ comment: 'Intro text on the Pattern Library "Menu" (restaurant menus) category page' }
		),
	},
	newsletter: {
		title: translate( 'WordPress Newsletter Patterns', {
			comment: 'HTML title of the Pattern Library "Newsletter" category page',
		} ),
		heading: translate( 'Newsletter Patterns', {
			comment: 'Heading of the Pattern Library "Newsletter" category page',
		} ),
		description: translate(
			'Grow your subscriber base with patterns designed for conversion. Our newsletter patterns simplify email collection and amplify audience growth, providing a direct line to engage with your committed followers.',
			{ comment: 'Intro text on the Pattern Library "Newsletter" category page' }
		),
	},
	services: {
		title: translate( 'WordPress Services Patterns', {
			comment: 'HTML title of the Pattern Library "Services" category page',
		} ),
		heading: translate( 'Services Patterns', {
			comment: 'Heading of the Pattern Library "Services" category page',
		} ),
		description: translate(
			'Present your services with designs that engage. Each pattern is crafted to help potential clients grasp the essence of your offerings, encouraging interaction and interest in your services.',
			{ comment: 'Intro text on the Pattern Library "Services" category page' }
		),
	},
	store: {
		title: translate( 'WordPress Store Patterns', {
			comment: 'HTML title of the Pattern Library "Store" category page',
		} ),
		heading: translate( 'Store Patterns', {
			comment: 'Heading of the Pattern Library "Store" category page',
		} ),
		description: translate(
			'Enhance your site with store patterns that simplify the display of your products. These patterns are designed to showcase products and entice visitors to browse and purchase with confidence from your affiliated online store.',
			{ comment: 'Intro text on the Pattern Library "Store" category page' }
		),
	},
	testimonials: {
		title: translate( 'WordPress Testimonial Patterns', {
			comment: 'HTML title of the Pattern Library "Testimonials" category page',
		} ),
		heading: translate( 'Testimonials Patterns', {
			comment: 'Heading of the Pattern Library "Testimonials" category page',
		} ),
		description: translate(
			'Build customer trust with patterns that spotlight satisfaction. Our patterns authentically present client testimonials to help you amplify credibility and reinforce brand loyalty.',
			{ comment: 'Intro text on the Pattern Library "Testimonials" category page' }
		),
	},
};

export const PatternsHeader = () => {
	const { category } = usePatternsContext();
	const { description, heading: header, title } = CONTENT[ category ] || CONTENT.default;

	const metas = [ { name: 'description', content: description } ];

	return (
		<>
			<DocumentHead title={ title } meta={ metas } />

			<header className="patterns-header">
				<div className="patterns-header__inner">
					<h1>{ header }</h1>

					<div className="patterns-header__description">{ preventWidows( description ) }</div>

					<div className="patterns-header__search-input">
						<PatternsSearchField />
					</div>
				</div>
			</header>
		</>
	);
};
