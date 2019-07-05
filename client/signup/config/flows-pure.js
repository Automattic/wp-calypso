/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { addQueryArgs } from 'lib/route';

export function generateFlows( {
	getSiteDestination = noop,
	getRedirectDestination = noop,
	getChecklistDestination = noop,
} = {} ) {
	const flows = {
		account: {
			steps: [ 'user' ],
			destination: '/',
			description: 'Create an account without a blog.',
			lastModified: '2015-07-07',
			pageTitle: translate( 'Create an account' ),
		},

		business: {
			steps: [
				'user',
				'site-type',
				'site-topic-with-preview',
				'site-title-with-preview',
				'site-style-with-preview',
				'domains-with-preview',
				'plans-business',
			],
			destination: getChecklistDestination,
			description: 'Create an account and a blog and then add the business plan to the users cart.',
			lastModified: '2019-06-17',
		},

		premium: {
			steps: [
				'user',
				'site-type',
				'site-topic-with-preview',
				'site-title-with-preview',
				'site-style-with-preview',
				'domains-with-preview',
				'plans-premium',
			],
			destination: getChecklistDestination,
			description: 'Create an account and a blog and then add the premium plan to the users cart.',
			lastModified: '2019-06-17',
		},

		personal: {
			steps: [
				'user',
				'site-type',
				'site-topic-with-preview',
				'site-title-with-preview',
				'site-style-with-preview',
				'domains-with-preview',
				'plans-personal',
			],
			destination: getChecklistDestination,
			description: 'Create an account and a blog and then add the personal plan to the users cart.',
			lastModified: '2019-06-17',
		},

		free: {
			steps: [
				'user',
				'site-type',
				'site-topic-with-preview',
				'site-title-with-preview',
				'site-style-with-preview',
				'domains-with-preview',
			],
			destination: getChecklistDestination,
			description: 'Create an account and a blog and default to the free plan.',
			lastModified: '2019-06-17',
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
			lastModified: '2019-06-17',
		},

		'with-theme': {
			steps: [ 'domains-theme-preselected', 'plans', 'user' ],
			destination: getSiteDestination,
			description: 'Preselect a theme to activate/buy from an external source',
			lastModified: '2016-01-27',
		},

		main: {
			steps: [ 'user', 'about', 'domains', 'plans' ],
			destination: getChecklistDestination,
			description: 'The current best performing flow in AB tests',
			lastModified: '2019-04-30',
		},

		onboarding: {
			steps: [
				'user',
				'site-type',
				'site-topic-with-preview',
				'site-title-with-preview',
				'site-style-with-preview',
				'domains-with-preview',
				'plans',
			],
			destination: getChecklistDestination,
			description: 'The improved onboarding flow.',
			lastModified: '2019-06-05',
		},

		'onboarding-blog': {
			steps: [
				'user',
				'site-type',
				'site-topic-with-preview',
				'site-title-with-preview',
				'site-style-with-preview',
				'domains',
				'plans',
			],
			destination: getChecklistDestination,
			description: 'The improved onboarding flow.',
			lastModified: '2019-04-30',
		},

		desktop: {
			steps: [ 'about', 'themes', 'domains', 'plans', 'user' ],
			destination: getChecklistDestination,
			description: 'Signup flow for desktop app',
			lastModified: '2019-04-30',
		},

		developer: {
			steps: [ 'site', 'user' ],
			destination: '/devdocs/welcome',
			description: 'Signup flow for developers in developer environment',
			lastModified: '2015-11-23',
		},

		'pressable-nux': {
			steps: [ 'creds-permission', 'creds-confirm', 'creds-complete' ],
			destination: '/stats',
			description: 'Allow new Pressable users to grant permission to server credentials',
			lastModified: '2017-11-20',
			disallowResume: true,
			allowContinue: false,
			hideFlowProgress: true,
		},

		'rewind-switch': {
			steps: [ 'rewind-migrate', 'rewind-were-backing' ],
			destination: '/activity-log',
			description:
				'Allows users with Jetpack plan with VaultPress credentials to migrate credentials',
			lastModified: '2018-01-27',
			disallowResume: true,
			allowContinue: false,
			hideFlowProgress: true,
		},

		'rewind-setup': {
			steps: [ 'rewind-add-creds', 'rewind-form-creds', 'rewind-were-backing' ],
			destination: '/activity-log',
			description: 'Allows users with Jetpack plan to setup credentials',
			lastModified: '2018-01-27',
			disallowResume: true,
			allowContinue: false,
			hideFlowProgress: true,
		},

		'rewind-auto-config': {
			steps: [ 'creds-permission', 'creds-confirm', 'rewind-were-backing' ],
			destination: '/activity-log',
			description:
				'Allow users of sites that can auto-config to grant permission to server credentials',
			lastModified: '2018-02-13',
			disallowResume: true,
			allowContinue: false,
			hideFlowProgress: true,
		},

		simple: {
			steps: [ 'passwordless' ],
			destination: '/',
			description: 'A very simple signup flow',
			lastModified: '2019-05-09',
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
			destination: '/activity-log',
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
			steps: [ 'user', 'site-type', 'domains', 'plans-ecommerce' ],
			destination: getSiteDestination,
			description: 'Signup flow for creating an online store with an Atomic site',
			lastModified: '2018-11-21',
		};
	}

	if ( config.isEnabled( 'signup/wpcc' ) ) {
		flows.wpcc = {
			steps: [ 'oauth2-user' ],
			destination: getRedirectDestination,
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

	flows[ 'launch-site' ] = {
		steps: [ 'domains-launch', 'plans-launch', 'launch' ],
		destination: getSiteDestination,
		description: 'A flow to launch a private site.',
		providesDependenciesInQuery: [ 'siteSlug' ],
		lastModified: '2019-01-16',
		pageTitle: translate( 'Launch your site' ),
	};

	flows.import = {
		steps: [ 'from-url', 'user', 'domains' ],
		destination: ( { importEngine, importSiteUrl, siteSlug } ) =>
			addQueryArgs(
				{
					engine: importEngine || null,
					'from-site': ( importSiteUrl && encodeURIComponent( importSiteUrl ) ) || null,
					signup: 1,
				},
				`/import/${ siteSlug }`
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
		destination: getRedirectDestination,
		description: "Crowdsignal's custom WordPress.com Connect signup flow",
		lastModified: '2018-11-14',
		disallowResume: true,
		autoContinue: true,
	};

	flows[ 'plan-no-domain' ] = {
		steps: [ 'user', 'site', 'plans' ],
		destination: getSiteDestination,
		description: 'Allow users to select a plan without a domain',
		lastModified: '2018-12-12',
	};

	return flows;
}

const flows = generateFlows();
export default flows;
