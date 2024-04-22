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
		heading: translate( 'Get a head start with patterns', {
			comment: 'Heading of the Pattern Library "Headers" category page',
		} ),
		description: translate(
			"Use predefined and beautiful patterns to decorate the header of your site, and catch your visitors' attention.",
			{ comment: 'Intro text on the Pattern Library "Headers" category page' }
		),
	},
	footer: {
		title: translate( 'WordPress Footer Patterns', {
			comment: 'HTML title of the Pattern Library "Footers" category page',
		} ),
		heading: translate( 'Build a strong foundation with patterns', {
			comment: 'Heading of the Pattern Library "Footers" category page',
		} ),
		description: translate(
			'Choose from our collection of patterns to add essential information and navigation to the bottom of your site.',
			{ comment: 'Intro text on the Pattern Library "Footers" category page' }
		),
	},
	about: {
		title: translate( 'WordPress About Patterns', {
			comment: 'HTML title of the Pattern Library "About" category page',
		} ),
		heading: translate( 'Tell your story with patterns', {
			comment: 'Heading of the Pattern Library "About" category page',
		} ),
		description: translate(
			'Add one of these patterns to your site to convey your mission and values compellingly.',
			{ comment: 'Intro text on the Pattern Library "About" category page' }
		),
	},
	posts: {
		title: translate( 'WordPress Blog Post Patterns', {
			comment: 'HTML title of the Pattern Library "Blog Posts" category page',
		} ),
		heading: translate( 'Get more readers with patterns', {
			comment: 'Heading of the Pattern Library "Blog Posts" category page',
		} ),
		description: translate(
			'Take advantage of this selection of patterns that make your writing pop and keep readers engaged.',
			{ comment: 'Intro text on the Pattern Library "Blog Posts" category page' }
		),
	},
	contact: {
		title: translate( 'WordPress Contact Patterns', {
			comment: 'HTML title of the Pattern Library "Contact" category page',
		} ),
		heading: translate( 'Connect with your audience using patterns', {
			comment: 'Heading of the Pattern Library "Contact" category page',
		} ),
		description: translate(
			'Pick from this set of patterns to add a contact form and a map to your site.',
			{ comment: 'Intro text on the Pattern Library "Contact" category page' }
		),
	},
	events: {
		title: translate( 'WordPress Events Patterns', {
			comment: 'HTML title of the Pattern Library "Events" category page',
		} ),
		heading: translate( 'Promote events with patterns', {
			comment: 'Heading of the Pattern Library "Events" category page',
		} ),
		description: translate(
			'Highlight upcoming events on your site with patterns that grab attention and inform.',
			{ comment: 'Intro text on the Pattern Library "Events" category page' }
		),
	},
	gallery: {
		title: translate( 'WordPress Gallery Patterns', {
			comment: 'HTML title of the Pattern Library "Gallery" category page',
		} ),
		heading: translate( 'Stunning galleries with patterns', {
			comment: 'Heading of the Pattern Library "Gallery" category page',
		} ),
		description: translate(
			'Pick from our set of patterns to showcase your visuals with elegance.',
			{ comment: 'Intro text on the Pattern Library "Gallery" category page' }
		),
	},
	intro: {
		title: translate( 'WordPress Intro Patterns', {
			comment: 'HTML title of the Pattern Library "Intro" category page',
		} ),
		heading: translate( 'Captivating introductions with patterns', {
			comment: 'Heading of the Pattern Library "Intro" category page',
		} ),
		description: translate(
			'Make a good first impression with patterns that welcome visitors and guide them through your site.',
			{ comment: 'Intro text on the Pattern Library "Intro" category page' }
		),
	},
	menu: {
		title: translate( 'WordPress Menu Patterns', {
			comment: 'HTML title of the Pattern Library "Menu" (restaurant menus) category page',
		} ),
		heading: translate( 'Craft delightful menus with patterns', {
			comment: 'Heading of the Pattern Library "Menu" (restaurant menus) category page',
		} ),
		description: translate(
			'Start your restaurant website with beautifully designed patterns that make your menus stand out.',
			{ comment: 'Intro text on the Pattern Library "Menu" (restaurant menus) category page' }
		),
	},
	newsletter: {
		title: translate( 'WordPress Newsletter Patterns', {
			comment: 'HTML title of the Pattern Library "Newsletter" category page',
		} ),
		heading: translate( 'Expand your audience with patterns', {
			comment: 'Heading of the Pattern Library "Newsletter" category page',
		} ),
		description: translate(
			'Collect emails on your site via one of those newsletter patterns, and build a subscribers list that you can reach to.',
			{ comment: 'Intro text on the Pattern Library "Newsletter" category page' }
		),
	},
	services: {
		title: translate( 'WordPress Services Patterns', {
			comment: 'HTML title of the Pattern Library "Services" category page',
		} ),
		heading: translate( 'Showcase services with patterns', {
			comment: 'Heading of the Pattern Library "Services" category page',
		} ),
		description: translate(
			'Help potential clients understand and engage with your services by adding one of those patterns to your site.',
			{ comment: 'Intro text on the Pattern Library "Services" category page' }
		),
	},
	store: {
		title: translate( 'WordPress Store Patterns', {
			comment: 'HTML title of the Pattern Library "Store" category page',
		} ),
		heading: translate( 'Start selling with patterns', {
			comment: 'Heading of the Pattern Library "Store" category page',
		} ),
		description: translate(
			'Convert your site to an online store with this set of patterns that can be used to showcase your products.',
			{ comment: 'Intro text on the Pattern Library "Store" category page' }
		),
	},
	testimonials: {
		title: translate( 'WordPress Testimonial Patterns', {
			comment: 'HTML title of the Pattern Library "Testimonials" category page',
		} ),
		heading: translate( 'Build trust with patterns', {
			comment: 'Heading of the Pattern Library "Testimonials" category page',
		} ),
		description: translate(
			'Leverage our set of patterns to showcase customer satisfaction on your site, and enhance trust in your brand or services.',
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
