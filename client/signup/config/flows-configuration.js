/**
 * Internal dependencies
 */
import config from 'config';

const getCheckoutUrl = ( dependencies ) => {
	return '/checkout/' + dependencies.siteSlug;
};

const dependenciesContainCartItem = ( dependencies ) => {
	return dependencies.cartItem || dependencies.domainItem || dependencies.themeItem;
};

const getSiteDestination = ( dependencies ) => {
	if ( dependenciesContainCartItem( dependencies ) ) {
		return getCheckoutUrl( dependencies );
	}

	let protocol = 'https';

	/**
	 * It is possible that non-wordpress.com sites are not HTTPS ready.
	 *
	 * Redirect them
	 */
	if ( ! dependencies.siteSlug.match( /wordpress\.[a-z]+$/i ) ) {
		protocol = 'http';
	}

	return protocol + '://' + dependencies.siteSlug;
};

const getPostsDestination = ( dependencies ) => {
	if ( dependenciesContainCartItem( dependencies ) ) {
		return getCheckoutUrl( dependencies );
	}

	return '/posts/' + dependencies.siteSlug;
};

const flows = {
	account: {
		steps: [ 'user' ],
		destination: '/',
		description: 'Create an account without a blog.',
		lastModified: '2015-07-07'
	},

	business: {
		steps: [ 'design-type', 'themes', 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/business/' + dependencies.siteSlug;
		},
		description: 'Create an account and a blog and then add the business plan to the users cart.',
		lastModified: '2016-06-02',
		meta: {
			skipBundlingPlan: true
		}
	},

	premium: {
		steps: [ 'design-type', 'themes', 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/premium/' + dependencies.siteSlug;
		},
		description: 'Create an account and a blog and then add the premium plan to the users cart.',
		lastModified: '2016-06-02',
		meta: {
			skipBundlingPlan: true
		}
	},

	free: {
		steps: [ 'design-type', 'themes', 'domains', 'user' ],
		destination: getSiteDestination,
		description: 'Create an account and a blog and default to the free plan.',
		lastModified: '2016-06-02'
	},

	'with-theme': {
		steps: [ 'domains-theme-preselected', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Preselect a theme to activate/buy from an external source',
		lastModified: '2016-01-27'
	},

	subdomain: {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Provide a vertical for subdomains',
		lastModified: '2016-10-31'
	},

	main: {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'The current best performing flow in AB tests',
		lastModified: '2016-05-23'
	},

	surveystep: {
		steps: [ 'survey', 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'The current best performing flow in AB tests',
		lastModified: '2016-05-23'
	},

	website: {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'This flow was originally used for the users who clicked "Create Website" ' +
		'on the two-button homepage. It is now linked to from the default homepage CTA as ' +
		'the main flow was slightly behind given translations.',
		lastModified: '2016-05-23'
	},

	blog: {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'This flow was originally used for the users who clicked "Create Blog" on ' +
		'the two-button homepage. It is now used from blog-specific landing pages so that ' +
		'verbiage in survey steps refers to "blog" instead of "website".',
		lastModified: '2016-05-23'
	},

	personal: {
		steps: [ 'design-type', 'themes', 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/personal/' + dependencies.siteSlug;
		},
		description: 'Create an account and a blog and then add the personal plan to the users cart.',
		lastModified: '2016-01-21'
	},

	'test-site': {
		steps: config( 'env' ) === 'development' ? [ 'site', 'user' ] : [ 'user' ],
		destination: '/',
		description: 'This flow is used to test the site step.',
		lastModified: '2015-09-22'
	},

	'delta-discover': {
		steps: [ 'user' ],
		destination: '/',
		description: 'A copy of the `account` flow for the Delta email campaigns. Half of users who ' +
		'go through this flow receive a reader-specific drip email series.',
		lastModified: '2016-05-03'
	},

	'delta-blog': {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'A copy of the `blog` flow for the Delta email campaigns. Half of users who go ' +
		'through this flow receive a blogging-specific drip email series.',
		lastModified: '2016-03-09'
	},

	'delta-site': {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'A copy of the `website` flow for the Delta email campaigns. Half of users who go ' +
		'through this flow receive a website-specific drip email series.',
		lastModified: '2016-03-09'
	},

	desktop: {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getPostsDestination,
		description: 'Signup flow for desktop app',
		lastModified: '2016-05-30'
	},

	developer: {
		steps: [ 'themes', 'site', 'user' ],
		destination: '/devdocs/welcome',
		description: 'Signup flow for developers in developer environment',
		lastModified: '2015-11-23'
	},

	pressable: {
		steps: [ 'design-type-with-store', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Signup flow for testing the pressable-store step',
		lastModified: '2016-06-27'
	},

	jetpack: {
		steps: [ 'jetpack-user' ],
		destination: '/'
	},

	'get-dot-blog': {
		steps: [ 'get-dot-blog-themes', 'get-dot-blog-plans' ],
		destination: getSiteDestination,
		description: 'Used by `get.blog` users that connect their site to WordPress.com',
		lastModified: '2016-11-14'
	},

	'user-first': {
		steps: [ 'user', 'design-type', 'themes', 'domains', 'plans' ],
		destination: getSiteDestination,
		description: 'User-first signup flow',
		lastModified: '2016-01-18',
	},
};

if ( config.isEnabled( 'signup/domain-first-flow' ) ) {
	flows[ 'domain-first' ] = {
		steps: [ 'site-or-domain', 'themes', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'An experimental approach for WordPress.com/domains',
		lastModified: '2017-01-16'
	};

	flows[ 'site-selected' ] = {
		steps: [ 'themes-site-selected', 'plans-site-selected' ],
		destination: getSiteDestination,
		providesDependenciesInQuery: [ 'siteSlug', 'siteId' ],
		description: 'A flow to test updating an existing site with `Signup`',
		lastModified: '2017-01-19'
	};
}

if ( config.isEnabled( 'signup/social' ) ) {
	flows.social = {
		steps: [ 'user-social' ],
		destination: '/',
		description: 'Create an account without a blog with social signup enabled.',
		lastModified: '2017-03-16'
	};
}

if ( config( 'env' ) === 'development' ) {
	flows[ 'test-plans' ] = {
		steps: [ 'site', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'This flow is used to test plans choice in signup',
		lastModified: '2016-06-30'
	};
}

export default flows;
