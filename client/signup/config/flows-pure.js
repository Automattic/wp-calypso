/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import { addQueryArgs } from 'lib/route';

export function generateFlows( { getSiteDestination = noop, getPostsDestination = noop } = {} ) {
	const flows = {
		account: {
			steps: [ 'user' ],
			destination: '/',
			description: 'Create an account without a blog.',
			lastModified: '2015-07-07',
		},

		business: {
			steps: [ 'user', 'about', 'themes', 'domains' ],
			destination: function( dependencies ) {
				return '/plans/select/business/' + dependencies.siteSlug;
			},
			description: 'Create an account and a blog and then add the business plan to the users cart.',
			lastModified: '2018-01-24',
			meta: {
				skipBundlingPlan: true,
			},
		},

		premium: {
			steps: [ 'user', 'about', 'themes', 'domains' ],
			destination: function( dependencies ) {
				return '/plans/select/premium/' + dependencies.siteSlug;
			},
			description: 'Create an account and a blog and then add the premium plan to the users cart.',
			lastModified: '2018-01-24',
			meta: {
				skipBundlingPlan: true,
			},
		},

		personal: {
			steps: [ 'user', 'about', 'themes', 'domains' ],
			destination: function( dependencies ) {
				return '/plans/select/personal/' + dependencies.siteSlug;
			},
			description: 'Create an account and a blog and then add the personal plan to the users cart.',
			lastModified: '2018-11-09',
		},

		free: {
			steps: [ 'user', 'about', 'themes', 'domains' ],
			destination: getSiteDestination,
			description: 'Create an account and a blog and default to the free plan.',
			lastModified: '2018-01-24',
		},

		blog: {
			steps: [ 'user', 'blog-themes', 'domains', 'plans' ],
			destination: getSiteDestination,
			description: 'Signup flow starting with blog themes',
			lastModified: '2017-09-01',
		},

		website: {
			steps: [ 'user', 'website-themes', 'domains', 'plans' ],
			destination: getSiteDestination,
			description: 'Signup flow starting with website themes',
			lastModified: '2017-09-01',
		},

		'rebrand-cities': {
			steps: [ 'rebrand-cities-welcome', 'user' ],
			destination: function( dependencies ) {
				return '/plans/select/business/' + dependencies.siteSlug;
			},
			description: 'Create an account for REBRAND cities partnership',
			lastModified: '2017-07-01',
			meta: {
				skipBundlingPlan: true,
			},
		},

		'with-theme': {
			steps: [ 'domains-theme-preselected', 'plans', 'user' ],
			destination: getSiteDestination,
			description: 'Preselect a theme to activate/buy from an external source',
			lastModified: '2016-01-27',
		},

		subdomain: {
			steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
			destination: getSiteDestination,
			description: 'Provide a vertical for subdomains',
			lastModified: '2016-10-31',
		},

		main: {
			steps: [ 'user', 'about', 'domains', 'plans' ],
			destination: getSiteDestination,
			description: 'The current best performing flow in AB tests',
			lastModified: '2018-10-16',
		},

		onboarding: {
			steps: [ 'user', 'site-type', 'site-topic', 'site-information', 'domains', 'plans' ],
			destination: getSiteDestination,
			description: 'The improved onboarding flow.',
			lastModified: '2018-10-22',
		},

		'onboarding-dev': {
			steps: [
				'user',
				'site-type',
				'site-style',
				'site-topic',
				'site-information',
				'domains',
				'plans',
			],
			destination: getSiteDestination,
			description: 'A temporary flow for holding under-development steps',
			lastModified: '2018-10-29',
		},

		'delta-discover': {
			steps: [ 'user' ],
			destination: '/',
			description:
				'A copy of the `account` flow for the Delta email campaigns. Half of users who ' +
				'go through this flow receive a reader-specific drip email series.',
			lastModified: '2016-05-03',
		},

		'delta-blog': {
			steps: [ 'about', 'themes', 'domains', 'plans', 'user' ],
			destination: getSiteDestination,
			description:
				'A copy of the `blog` flow for the Delta email campaigns. Half of users who go ' +
				'through this flow receive a blogging-specific drip email series.',
			lastModified: '2018-01-24',
		},

		'delta-site': {
			steps: [ 'about', 'themes', 'domains', 'plans', 'user' ],
			destination: getSiteDestination,
			description:
				'A copy of the `website` flow for the Delta email campaigns. Half of users who go ' +
				'through this flow receive a website-specific drip email series.',
			lastModified: '2018-01-24',
		},

		desktop: {
			steps: [ 'about', 'themes', 'domains', 'plans', 'user' ],
			destination: getPostsDestination,
			description: 'Signup flow for desktop app',
			lastModified: '2018-01-24',
		},

		developer: {
			steps: [ 'site', 'user' ],
			destination: '/devdocs/welcome',
			description: 'Signup flow for developers in developer environment',
			lastModified: '2015-11-23',
		},

		'pressable-nux': {
			steps: [ 'creds-permission', 'creds-confirm', 'creds-complete' ],
			destination: () => {
				return '/stats';
			},
			description: 'Allow new Pressable users to grant permission to server credentials',
			lastModified: '2017-11-20',
			disallowResume: true,
			allowContinue: false,
			hideFlowProgress: true,
		},

		'rewind-switch': {
			steps: [ 'rewind-migrate', 'rewind-were-backing' ],
			destination: () => {
				return '/activity-log';
			},
			description:
				'Allows users with Jetpack plan with VaultPress credentials to migrate credentials',
			lastModified: '2018-01-27',
			disallowResume: true,
			allowContinue: false,
			hideFlowProgress: true,
		},

		'rewind-setup': {
			steps: [ 'rewind-add-creds', 'rewind-form-creds', 'rewind-were-backing' ],
			destination: () => {
				return '/activity-log';
			},
			description: 'Allows users with Jetpack plan to setup credentials',
			lastModified: '2018-01-27',
			disallowResume: true,
			allowContinue: false,
			hideFlowProgress: true,
		},

		'rewind-auto-config': {
			steps: [ 'creds-permission', 'creds-confirm', 'rewind-were-backing' ],
			destination: () => {
				return '/activity-log';
			},
			description:
				'Allow users of sites that can auto-config to grant permission to server credentials',
			lastModified: '2018-02-13',
			disallowResume: true,
			allowContinue: false,
			hideFlowProgress: true,
		},
	};

	if ( config.isEnabled( 'rewind/clone-site' ) ) {
		flows[ 'clone-site' ] = {
			steps: [
				'clone-start',
				'clone-destination',
				'clone-credentials',
				'clone-point',
				'clone-ready',
				'clone-cloning',
			],
			destination: () => {
				return '/activity-log';
			},
			description: 'Allow Jetpack users to clone a site via Rewind (alternate restore)',
			lastModified: '2018-05-28',
			disallowResume: true,
			allowContinue: false,
		};
	}

	if ( config.isEnabled( 'signup/atomic-store-flow' ) ) {
		// Important: For any changes done to the ecommerce flow,
		// please copy the same changes to ecommerce-onboarding flow too
		flows.ecommerce = {
			steps: [ 'user', 'about', 'domains', 'plans' ],
			destination: getSiteDestination,
			description: 'Signup flow for creating an online store with an Atomic site',
			lastModified: '2018-01-24',
		};

		flows[ 'ecommerce-onboarding' ] = {
			steps: [ 'user', 'site-type', 'domains', 'plans' ],
			destination: getSiteDestination,
			description: 'Signup flow for creating an online store with an Atomic site',
			lastModified: '2018-11-21',
		};

		flows[ 'store-woo' ] = {
			steps: [ 'domains-store', 'plans-store-nux', 'user' ],
			destination: getSiteDestination,
			description: 'Short signup flow for creating an online store with an Atomic site',
			lastModified: '2018-03-15',
		};
	}

	if ( config.isEnabled( 'signup/wpcc' ) ) {
		flows.wpcc = {
			steps: [ 'oauth2-user' ],
			destination: function( dependencies ) {
				return dependencies.oauth2_redirect || '/';
			},
			description: 'WordPress.com Connect signup flow',
			lastModified: '2017-08-24',
			disallowResume: true, // don't allow resume so we don't clear query params when we go back in the history
		};
	}

	flows.domain = {
		steps: [
			'domain-only',
			'site-or-domain',
			'site-picker',
			'themes',
			'plans-site-selected',
			'user',
		],
		destination: getSiteDestination,
		description: 'An experimental approach for WordPress.com/domains',
		disallowResume: true,
		lastModified: '2017-05-09',
	};

	flows[ 'site-selected' ] = {
		steps: [ 'themes-site-selected', 'plans-site-selected' ],
		destination: getSiteDestination,
		providesDependenciesInQuery: [ 'siteSlug', 'siteId' ],
		description: 'A flow to test updating an existing site with `Signup`',
		lastModified: '2017-01-19',
	};

	flows.private = {
		steps: [ 'user', 'site' ],
		destination: getSiteDestination,
		description: 'Test private site signup',
		lastModified: '2018-10-22',
	};

	flows.import = {
		steps: [ 'from-url', 'user', 'domains' ],
		destination: ( { importSiteDetails, importUrl, siteSlug } ) =>
			addQueryArgs(
				{
					engine: importSiteDetails.engine === 'wix' ? 'wix' : null,
					'from-site': ( importUrl && encodeURIComponent( importUrl ) ) || null,
				},
				`/settings/import/${ siteSlug }`
			),
		description: 'A flow to kick off an import during signup',
		disallowResume: true,
		lastModified: '2018-09-12',
	};

	flows.reader = {
		steps: [ 'reader-landing', 'user' ],
		destination: '/',
		description: 'Signup for an account and migrate email subs to the Reader.',
		lastModified: '2018-10-29',
	};

	flows.crowdsignal = {
		steps: [ 'oauth2-name' ],
		destination: dependencies => dependencies.oauth2_redirect || '/',
		description: "Crowdsignal's custom WordPress.com Connect signup flow",
		lastModified: '2018-11-14',
		disallowResume: true,
		autoContinue: true,
	};

	flows.name = {
		steps: [ 'displayname', 'about', 'domains', 'plans' ],
		destination: getSiteDestination,
		description: 'Ask for a display name not a user name',
		lastModified: '2018-12-12',
	};

	return flows;
}

const flows = generateFlows();
export default flows;
