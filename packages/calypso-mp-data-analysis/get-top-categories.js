import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import fs from 'fs-extra';

// empty translation becaue laziness
const __ = ( name ) => name;

const categories = {
	analytics: {
		name: __( 'Analytics' ),
		description: __( 'Analytics' ),
		icon: 'grid',
		slug: 'analytics',
		tags: [ 'analytics' ],
	},
	booking: {
		name: __( 'Booking & Scheduling' ),
		description: __( 'Booking' ),
		icon: 'grid',
		slug: 'booking',
		tags: [
			'booking',
			'scheduling',
			'appointment',
			'reservations',
			'reservation',
			'booking-calendar',
		],
	},
	customer: {
		name: __( 'Customer Service' ),
		description: __( 'Customer Service' ),
		icon: 'grid',
		slug: 'customer',
		tags: [ 'customer-service' ],
	},
	design: {
		name: __( 'Design' ),
		description: __( 'Design' ),
		icon: 'grid',
		slug: 'design',
		tags: [ 'design' ],
	},
	donations: {
		name: __( 'Donations' ),
		description: __( 'Donations' ),
		icon: 'grid',
		slug: 'donations',
		tags: [
			'donation',
			'donation-plugin',
			'donations',
			'donate',
			'fundraising',
			'crowdfunding',
			'recurring-donations',
			'charity',
		],
	},
	ecommerce: {
		name: __( 'Ecommerce & Business' ),
		description: __( 'Ecommerce' ),
		icon: 'grid',
		slug: 'ecommerce',
		tags: [ 'ecommerce', 'e-commerce', 'woocommerce', 'business', 'business-directory' ],
	},
	education: {
		name: __( 'Education' ),
		description: __( 'Education' ),
		icon: 'grid',
		slug: 'education',
		tags: [ 'education' ],
	},
	email: {
		name: __( 'Email' ),
		description: __( 'Email' ),
		icon: 'grid',
		slug: 'email',
		tags: [ 'email' ],
	},
	finance: {
		name: __( 'Finance & Payments' ),
		description: __( 'Finance' ),
		icon: 'grid',
		slug: 'finance',
		tags: [ 'finance', 'payment', 'credit-card', 'payment-gateway' ],
	},
	marketing: {
		name: __( 'Marketing' ),
		description: __( 'Marketing' ),
		icon: 'grid',
		slug: 'marketing',
		tags: [ 'marketing' ],
	},
	photo: {
		name: __( 'Photo & Video' ),
		description: __( 'Photo & Video' ),
		icon: 'grid',
		slug: 'photo',
		tags: [ 'photo', 'video', 'media' ],
	},
	posts: {
		name: __( 'Posts & Posting' ),
		description: __( 'Posts & Posting' ),
		icon: 'grid',
		slug: 'posts',
		tags: [ 'posts', 'post', 'page', 'pages' ],
	},
	seo: {
		name: __( 'Search Optimization' ),
		description: __( 'Search Optimization' ),
		icon: 'grid',
		slug: 'seo',
		tags: [ 'seo' ],
	},
	security: {
		name: __( 'Security' ),
		description: __( 'Security' ),
		icon: 'grid',
		slug: 'security',
		tags: [ 'security' ],
	},
	shipping: {
		name: __( 'Shipping & Delivery' ),
		description: __( 'Shipping & Delivery' ),
		icon: 'grid',
		slug: 'shipping',
		tags: [
			'shipping',
			'usps',
			'woocommerce-shipping',
			'delivery',
			'shipment-tracking',
			'food-delivery',
			'food-pickup',
			'courier',
		],
	},
	social: {
		name: __( 'Social' ),
		description: __( 'Social' ),
		icon: 'grid',
		slug: 'social',
		tags: [ 'social', 'facebook', 'twitter', 'instagram', 'tiktok', 'youtube', 'pinterest' ],
	},
	widgets: {
		name: __( 'Widgets' ),
		description: __( 'Widgets' ),
		icon: 'grid',
		slug: 'widgets',
		tags: [ 'widgets' ],
	},
};

const getLocale = ( lang ) => {
	if ( lang === 'en' ) {
		return 'en_US';
	}

	if ( lang.length === 2 ) {
		return `${ lang }_${ lang.toUpperCase() }`;
	}

	return lang.replace( '-', '_' );
};

const tagsCountMap = {};
const csvFileContent = await fs.readFile( './top-100-searches.csv', {
	encoding: 'utf-8',
} );
const records = parse( csvFileContent, {
	columns: true,
	skip_empty_lines: true,
} );

for ( const record of records ) {
	const { data: wporgData } = await fetch(
		'https://api.wordpress.org/plugins/info/1.2?' +
			new URLSearchParams( {
				action: 'query_plugins',
				'request[page]': 1,
				'request[per_page]': 24,
				'request[search]': record.search_term,
				'request[locale]': getLocale( record.language ),
			} )
	);

	const { data: wpcomData } = await fetch(
		'https://public-api.wordpress.com/wpcom/v2/marketplace/products?' +
			new URLSearchParams( {
				type: 'all',
				_envelope: 1,
				q: record.search_term,
			} )
	);

	const wpcomPlugins = Object.values( wpcomData.body.results );
	const wporgPlugins = Object.values( wporgData.plugins );

	const plugins = [ ...wpcomPlugins, ...wporgPlugins ].slice( 0, 6 ); // show top 6 plugins

	console.log(
		`fetched plugins for ${ record.search_term }: locale - ${ getLocale(
			record.language
		) } results - wpcom: ${ wpcomPlugins.length } | wporg: ${ wporgPlugins.length }`
	);

	plugins.forEach( ( plugin ) => {
		Object.keys( plugin.tags || {} ).forEach( ( tag ) => {
			tagsCountMap[ tag ] = tagsCountMap[ tag ]
				? tagsCountMap[ tag ] + parseInt( record.count )
				: parseInt( record.count );
		} );
	} );
}

const topTags = Object.keys( tagsCountMap )
	.map( ( tag ) => ( {
		tag: tag,
		count: tagsCountMap[ tag ],
	} ) )
	.sort( ( a, b ) => a.count - b.count )
	.reverse();

await fs.outputFile(
	'results/top-tags.csv',
	stringify( topTags, { columns: [ { key: 'tag' }, { key: 'count' } ], header: true } )
);

const topCategories = Object.values( categories )
	.map( ( category ) => {
		const count = category.tags.reduce( ( acc, categoryTag ) => {
			return acc + ( topTags.find( ( { tag } ) => tag === categoryTag )?.count ?? 0 );
		}, 0 );

		return {
			category: category.slug,
			count,
		};
	} )
	.sort( ( a, b ) => a.count - b.count )
	.reverse();

await fs.outputFile(
	'results/top-categories.csv',
	stringify( topCategories, { columns: [ { key: 'category' }, { key: 'count' } ], header: true } )
);
