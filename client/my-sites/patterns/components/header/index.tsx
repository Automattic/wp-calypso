import { Substitution, translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { preventWidows } from 'calypso/lib/formatting';
import { PatternsSearchField } from 'calypso/my-sites/patterns/components/search-field';
import type { Category } from 'calypso/my-sites/patterns/types';

import './style.scss';

const OPTIONS = {
	home: {
		title: {
			comment: 'HTML title of the page that showcases block patterns',
			textOnly: true,
		},
		header: {
			comment: 'Header of the page that showcases block patterns',
			textOnly: true,
		},
		description: {
			comment: 'Description of the page that showcases block patterns',
			textOnly: true,
		},
	},
	category: {
		title: {
			comment: 'HTML title of the page that lists block patterns for a specific category',
			textOnly: true,
		},
		header: {
			comment: 'Header of the page that lists block patterns for a specific category',
			textOnly: true,
		},
		description: {
			comment: 'Description of the page that lists block patterns for a specific category',
			textOnly: true,
		},
	},
};

const CONTENT: Record<
	Category[ 'name' ],
	{ description: Substitution; header: Substitution; title: Substitution }
> = {
	default: {
		title: translate( 'WordPress Patterns', OPTIONS.home.title ),
		header: translate( "It's easier with patterns", OPTIONS.home.header ),
		description: translate(
			'Dive into hundreds of expertly designed, fully responsive layouts, and bring any kind of site to life, faster.',
			OPTIONS.home.description
		),
	},
	header: {
		title: translate( 'WordPress Header Patterns', OPTIONS.category.title ),
		header: translate( 'Get a head start with patterns', OPTIONS.category.header ),
		description: translate(
			"Use predefined and beautiful patterns to decorate the header of your site, and catch your visitors' attention.",
			OPTIONS.category.description
		),
	},
	footer: {
		title: translate( 'WordPress Footer Patterns', OPTIONS.category.title ),
		header: translate( 'Build a strong foundation with patterns', OPTIONS.category.header ),
		description: translate(
			'Choose from our collection of patterns to add essential information and navigation to the bottom of your site.',
			OPTIONS.category.description
		),
	},
	about: {
		title: translate( 'WordPress About Patterns', OPTIONS.category.title ),
		header: translate( 'Tell your story with patterns', OPTIONS.category.header ),
		description: translate(
			'Add one of these patterns to your site to convey your mission and values compellingly.',
			OPTIONS.category.description
		),
	},
	posts: {
		title: translate( 'WordPress Blog Post Patterns', OPTIONS.category.title ),
		header: translate( 'Get more readers with patterns', OPTIONS.category.header ),
		description: translate(
			'Take advantage of this selection of patterns that make your writing pop and keep readers engaged.',
			OPTIONS.category.description
		),
	},
	contact: {
		title: translate( 'WordPress Contact Patterns', OPTIONS.category.title ),
		header: translate( 'Connect with your audience using patterns', OPTIONS.category.header ),
		description: translate(
			'Pick from this set of patterns to add a contact form and a map to your site.',
			OPTIONS.category.description
		),
	},
	events: {
		title: translate( 'WordPress Events Patterns', OPTIONS.category.title ),
		header: translate( 'Promote events with patterns', OPTIONS.category.header ),
		description: translate(
			'Highlight upcoming events on your site with patterns that grab attention and inform.',
			OPTIONS.category.description
		),
	},
	gallery: {
		title: translate( 'WordPress Gallery Patterns', OPTIONS.category.title ),
		header: translate( 'Stunning galleries with patterns', OPTIONS.category.header ),
		description: translate(
			'Pick from our set of patterns to showcase your visuals with elegance.',
			OPTIONS.category.description
		),
	},
	intro: {
		title: translate( 'WordPress Intro Patterns', OPTIONS.category.title ),
		header: translate( 'Captivating introductions with patterns', OPTIONS.category.header ),
		description: translate(
			'Make a good first impression with patterns that welcome visitors and guide them through your site.',
			OPTIONS.category.description
		),
	},
	menu: {
		title: translate( 'WordPress Menu Patterns', OPTIONS.category.title ),
		header: translate( 'Craft delightful menus with patterns', OPTIONS.category.header ),
		description: translate(
			'Start your restaurant website with beautifully designed patterns that make your menus stand out.',
			OPTIONS.category.description
		),
	},
	newsletter: {
		title: translate( 'WordPress Newsletter Patterns', OPTIONS.category.title ),
		header: translate( 'Expand your audience with patterns', OPTIONS.category.header ),
		description: translate(
			'Collect emails on your site via one of those newsletter patterns, and build a subscribers list that you can reach to.',
			OPTIONS.category.description
		),
	},
	services: {
		title: translate( 'WordPress Services Patterns', OPTIONS.category.title ),
		header: translate( 'Showcase services with patterns', OPTIONS.category.header ),
		description: translate(
			'Help potential clients understand and engage with your services by adding one of those patterns to your site.',
			OPTIONS.category.description
		),
	},
	store: {
		title: translate( 'WordPress Store Patterns', OPTIONS.category.title ),
		header: translate( 'Start selling with patterns', OPTIONS.category.header ),
		description: translate(
			'Convert your site to an online store with this set of patterns that can be used to showcase your products.',
			OPTIONS.category.description
		),
	},
	testimonials: {
		title: translate( 'WordPress Testimonial Patterns', OPTIONS.category.title ),
		header: translate( 'Build trust with patterns', OPTIONS.category.header ),
		description: translate(
			'Leverage our set of patterns to showcase customer satisfaction on your site, and enhance trust in your brand or services.',
			OPTIONS.category.description
		),
	},
};

export const PatternsHeader = ( { category }: { category: Category[ 'name' ] } ) => {
	const { description, header, title } = CONTENT[ category ] || CONTENT.default;

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
