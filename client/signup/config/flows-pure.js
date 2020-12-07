/**
 * External dependencies
 */
import { noop } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';
import { addQueryArgs } from 'calypso/lib/route';

export function generateFlows( {
	getSiteDestination = noop,
	getRedirectDestination = noop,
	getSignupDestination = noop,
	getLaunchDestination = noop,
	getThankYouNoSiteDestination = noop,
	getChecklistThemeDestination = noop,
} = {} ) {
	const flows = {
		account: {
			steps: [ 'user' ],
			destination: '/',
			description: 'Create an account without a blog.',
			lastModified: '2020-08-12',
			pageTitle: translate( 'Create an account' ),
			showRecaptcha: true,
		},

		business: {
			steps: [ 'user', 'domains', 'plans-business' ],
			destination: getSignupDestination,
			description: 'Create an account and a blog and then add the business plan to the users cart.',
			lastModified: '2020-08-11',
			showRecaptcha: true,
		},

		premium: {
			steps: [ 'user', 'domains', 'plans-premium' ],
			destination: getSignupDestination,
			description: 'Create an account and a blog and then add the premium plan to the users cart.',
			lastModified: '2020-08-11',
			showRecaptcha: true,
		},

		personal: {
			steps: [ 'user', 'domains', 'plans-personal' ],
			destination: getSignupDestination,
			description: 'Create an account and a blog and then add the personal plan to the users cart.',
			lastModified: '2020-08-11',
			showRecaptcha: true,
		},

		free: {
			steps: [ 'user', 'domains' ],
			destination: getSignupDestination,
			description: 'Create an account and a blog and default to the free plan.',
			lastModified: '2020-08-11',
			showRecaptcha: true,
		},

		'rebrand-cities': {
			steps: [ 'rebrand-cities-welcome', 'user' ],
			destination: function ( dependencies ) {
				return '/plans/select/business/' + dependencies.siteSlug;
			},
			description: 'Create an account for REBRAND cities partnership',
			lastModified: '2019-06-17',
		},

		'with-theme': {
			steps: [ 'domains-theme-preselected', 'plans', 'user' ],
			destination: getChecklistThemeDestination,
			description: 'Preselect a theme to activate/buy from an external source',
			lastModified: '2020-08-11',
			showRecaptcha: true,
		},

		'design-first': {
			steps: [
				'template-first-themes',
				'user',
				'site-type-with-theme',
				'site-topic-with-theme',
				'site-title',
				'domains',
				'plans',
			],
			destination: getChecklistThemeDestination,
			description: 'Start with one of our template-first (Gutenberg) themes.',
			lastModified: '2019-10-16',
		},

		main: {
			steps: [ 'user', 'about', 'domains', 'plans' ],
			destination: getSignupDestination,
			description: 'The current best performing flow in AB tests',
			lastModified: '2019-06-20',
		},

		'onboarding-with-preview': {
			steps: [
				'user',
				'site-type',
				'site-topic-with-preview',
				'site-title-with-preview',
				'domains-with-preview',
				'plans',
			],
			destination: getSignupDestination,
			description: 'The improved onboarding flow.',
			lastModified: '2020-03-03',
			showRecaptcha: true,
		},

		onboarding: {
			steps: [ 'user', 'domains', 'plans', 'secure-your-brand' ],
			destination: getSignupDestination,
			description: 'Abridged version of the onboarding flow. Read more in https://wp.me/pau2Xa-Vs.',
			lastModified: '2020-11-24',
			showRecaptcha: true,
		},

		'onboarding-registrationless': {
			steps: [ 'domains', 'plans-new', 'user-new' ],
			destination: getSignupDestination,
			description: 'Checkout without user account or site. Read more https://wp.me/pau2Xa-1hW',
			lastModified: '2020-06-26',
			showRecaptcha: true,
		},

		desktop: {
			steps: [ 'about', 'themes', 'domains', 'plans', 'user' ],
			destination: getSignupDestination,
			description: 'Signup flow for desktop app',
			lastModified: '2020-08-11',
			showRecaptcha: true,
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
			steps: [ 'rewind-form-creds', 'rewind-were-backing' ],
			destination: '/activity-log',
			description: 'Allows users with Jetpack plan to setup credentials',
			lastModified: '2019-11-11',
			disallowResume: true,
			allowContinue: false,
			hideFlowProgress: true,
			forceLogin: true,
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

	if ( isEnabled( 'signup/atomic-store-flow' ) ) {
		// Important: For any changes done to the ecommerce flow,
		// please copy the same changes to ecommerce-onboarding flow too
		flows.ecommerce = {
			steps: [ 'user', 'domains', 'plans-ecommerce-fulfilled' ],
			destination: getSignupDestination,
			description: 'Signup flow for creating an online store with an Atomic site',
			lastModified: '2020-08-11',
			showRecaptcha: true,
		};

		flows[ 'ecommerce-onboarding' ] = {
			steps: [ 'user', 'domains', 'plans-ecommerce' ],
			destination: getSignupDestination,
			description: 'Signup flow for creating an online store with an Atomic site',
			lastModified: '2020-03-04',
		};

		flows[ 'ecommerce-design-first' ] = {
			steps: [
				'template-first-themes',
				'user',
				'site-type-with-theme',
				'domains',
				'plans-ecommerce',
			],
			destination: getSignupDestination,
			description:
				'Signup flow for creating an online store with an Atomic site, forked from the design-first flow',
			lastModified: '2019-11-27',
		};
	}

	if ( isEnabled( 'signup/wpcc' ) ) {
		flows.wpcc = {
			steps: [ 'oauth2-user' ],
			destination: getRedirectDestination,
			description: 'WordPress.com Connect signup flow',
			lastModified: '2017-08-24',
			disallowResume: true, // don't allow resume so we don't clear query params when we go back in the history
			showRecaptcha: true,
		};
	}

	if ( isEnabled( 'signup/wpforteams' ) ) {
		flows.p2 = {
			steps: [ 'p2-site', 'p2-details', 'user' ],
			destination: ( dependencies ) => `https://${ dependencies.siteSlug }`,
			description: 'P2 signup flow',
			lastModified: '2020-09-01',
			showRecaptcha: true,
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
		destination: getThankYouNoSiteDestination,
		description: 'An experimental approach for WordPress.com/domains',
		disallowResume: true,
		lastModified: '2020-08-11',
		showRecaptcha: true,
	};

	flows[ 'add-domain' ] = {
		steps: [
			'select-domain',
			'site-or-domain',
			'site-picker',
			'themes',
			'plans-site-selected',
			'user',
		],
		destination: getThankYouNoSiteDestination,
		description: 'An approach to add a domain via the all domains view',
		disallowResume: true,
		lastModified: '2020-08-11',
		showRecaptcha: true,
	};

	flows[ 'site-selected' ] = {
		steps: [ 'themes-site-selected', 'plans-site-selected' ],
		destination: getSiteDestination,
		providesDependenciesInQuery: [ 'siteSlug', 'siteId' ],
		description: 'A flow to test updating an existing site with `Signup`',
		lastModified: '2017-01-19',
	};

	flows[ 'launch-site' ] = {
		steps: [ 'domains-launch', 'plans-launch', 'free-plans-domain-discount-launch', 'launch' ],
		destination: getLaunchDestination,
		description: 'A flow to launch a private site.',
		providesDependenciesInQuery: [ 'siteSlug' ],
		lastModified: '2019-11-22',
		pageTitle: translate( 'Launch your site' ),
	};

	const importSteps = [ 'domains', 'plans-import' ];

	const importDestination = ( { importSiteEngine, importSiteUrl, siteSlug } ) =>
		addQueryArgs(
			{
				engine: importSiteEngine || null,
				'from-site': importSiteUrl ? encodeURIComponent( importSiteUrl ) : null,
				signup: 1,
			},
			`/import/${ siteSlug }`
		);

	flows.import = {
		steps: [ 'user', 'from-url', ...importSteps ],
		destination: importDestination,
		description: 'A flow to kick off an import during signup',
		disallowResume: true,
		lastModified: '2020-08-11',
		showRecaptcha: true,
	};

	flows[ 'import-onboarding' ] = {
		// IMPORTANT: steps should match the onboarding flow through the `site-type` step to prevent issues
		// when switching from the onboarding flow.
		steps: [ 'user', 'site-type', 'import-url', 'import-preview', ...importSteps ],
		destination: importDestination,
		description: 'Import flow that can be used from the onboarding flow',
		disallowResume: true,
		lastModified: '2020-08-11',
		showRecaptcha: true,
	};

	flows.reader = {
		steps: [ 'reader-landing', 'user' ],
		destination: '/',
		description: 'Signup for an account and migrate email subs to the Reader.',
		lastModified: '2020-08-11',
		showRecaptcha: true,
	};

	flows.crowdsignal = {
		steps: [ 'oauth2-name' ],
		destination: getRedirectDestination,
		description: "Crowdsignal's custom WordPress.com Connect signup flow",
		lastModified: '2018-11-14',
		disallowResume: true,
		autoContinue: true,
		showRecaptcha: true,
	};

	flows[ 'plan-no-domain' ] = {
		steps: [ 'user', 'site', 'plans' ],
		destination: getSiteDestination,
		description: 'Allow users to select a plan without a domain',
		lastModified: '2020-08-11',
		showRecaptcha: true,
	};

	if ( isEnabled( 'signup/full-site-editing' ) ) {
		flows[ 'test-fse' ] = {
			steps: [ 'user', 'fse-themes', 'domains', 'plans' ],
			destination: getSignupDestination,
			description: 'User testing Signup flow for Full Site Editing',
			lastModified: '2019-12-02',
		};
	}

	flows[ 'new-launch' ] = {
		steps: [ 'domains-launch', 'plans-launch', 'launch' ],
		destination: getLaunchDestination,
		description: 'Launch flow for a site created from /new',
		lastModified: '2020-04-28',
		pageTitle: translate( 'Launch your site' ),
		providesDependenciesInQuery: [ 'siteSlug', 'source' ],
	};

	flows[ 'launch-only' ] = {
		steps: [ 'launch' ],
		destination: getLaunchDestination,
		description:
			'Launch flow without domain or plan selected, used for sites that already have a paid plan and domain (e.g. via the launch banner in the site preview)',
		lastModified: '2020-11-30',
		pageTitle: translate( 'Launch your site' ),
		providesDependenciesInQuery: [ 'siteSlug' ],
	};

	return flows;
}

const flows = generateFlows();
export default flows;
