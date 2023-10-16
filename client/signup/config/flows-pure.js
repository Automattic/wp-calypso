import { isEnabled } from '@automattic/calypso-config';
import { HOSTING_LP_FLOW } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';

const noop = () => {};

export function generateFlows( {
	getSiteDestination = noop,
	getRedirectDestination = noop,
	getSignupDestination = noop,
	getLaunchDestination = noop,
	getDomainSignupFlowDestination = noop,
	getEmailSignupFlowDestination = noop,
	getChecklistThemeDestination = noop,
	getWithThemeDestination = noop,
	getWithPluginDestination = noop,
	getDestinationFromIntent = noop,
	getDIFMSignupDestination = noop,
	getDIFMSiteContentCollectionDestination = noop,
	getHostingFlowDestination = noop,
} = {} ) {
	const flows = [
		{
			name: HOSTING_LP_FLOW,
			steps: [ 'user-hosting' ],
			destination: getHostingFlowDestination,
			description: 'Create an account and redirect the user to the hosted site flow forking step.',
			lastModified: '2023-07-18',
			showRecaptcha: true,
		},
		{
			name: 'account',
			steps: [ 'user' ],
			destination: getRedirectDestination,
			description: 'Create an account without a blog.',
			lastModified: '2023-06-16',
			get pageTitle() {
				return translate( 'Create an account' );
			},
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'toStepper' ],
			optionalDependenciesInQuery: [ 'toStepper' ],
		},
		{
			name: 'business',
			steps: [ 'user', 'domains', 'plans-business' ],
			destination: getSignupDestination,
			description: 'Create an account and a blog and then add the business plan to the users cart.',
			lastModified: '2020-08-11',
			showRecaptcha: true,
		},
		{
			name: 'premium',
			steps: [ 'user', 'domains', 'plans-premium' ],
			destination: getSignupDestination,
			description: 'Create an account and a blog and then add the premium plan to the users cart.',
			lastModified: '2020-08-11',
			showRecaptcha: true,
		},
		{
			name: 'personal',
			steps: [ 'user', 'domains', 'plans-personal' ],
			destination: getSignupDestination,
			description: 'Create an account and a blog and then add the personal plan to the users cart.',
			lastModified: '2020-08-11',
			showRecaptcha: true,
		},
		{
			name: 'pro',
			steps: [ 'user', 'domains', 'plans-pro' ],
			destination: getSignupDestination,
			description: 'Create an account and a blog and then add the pro plan to the users cart.',
			lastModified: '2022-03-08',
			showRecaptcha: true,
		},
		{
			name: 'starter',
			steps: [ 'user', 'domains', 'plans-starter' ],
			destination: getSignupDestination,
			description: 'Create an account and a blog and then add the starter plan to the users cart.',
			lastModified: '2022-05-05',
			showRecaptcha: true,
		},
		{
			name: 'free',
			steps: [ 'user-social', 'domains' ],
			destination: getSignupDestination,
			description: 'Create an account and a blog and default to the free plan.',
			lastModified: '2020-08-11',
			showRecaptcha: true,
		},
		{
			name: 'with-theme',
			steps: [ 'user', 'domains-theme-preselected', 'plans-theme-preselected' ],
			destination: getWithThemeDestination,
			description: 'Preselect a theme to activate/buy from an external source',
			lastModified: '2023-04-27',
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'theme' ],
			optionalDependenciesInQuery: [ 'theme_type', 'style_variation' ],
		},
		{
			name: 'with-theme-assembler',
			steps: [ 'user', 'domains-theme-preselected', 'plans' ],
			destination: getChecklistThemeDestination,
			description: 'Preselect a theme to activate/buy from an external source with the assembler.',
			lastModified: '2023-02-06',
			showRecaptcha: true,
		},
		{
			name: 'with-plugin',
			steps: [ 'user', 'domains', 'plans-business-with-plugin' ],
			destination: getWithPluginDestination,
			description: 'Preselect a plugin to activate/buy, a Business plan is needed',
			lastModified: '2023-07-19',
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'plugin', 'billing_period' ],
		},
		{
			name: 'onboarding',
			steps: isEnabled( 'signup/professional-email-step' )
				? [ 'user', 'domains', 'emails', 'plans' ]
				: [ 'user', 'domains', 'plans' ],
			destination: getSignupDestination,
			description: 'Abridged version of the onboarding flow. Read more in https://wp.me/pau2Xa-Vs.',
			lastModified: '2020-12-10',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'onboarding-2023-pricing-grid',
			steps: isEnabled( 'signup/professional-email-step' )
				? [ 'user', 'domains', 'emails', 'plans' ]
				: [ 'user', 'domains', 'plans' ],
			destination: getSignupDestination,
			description: 'Abridged version of the onboarding flow. Read more in https://wp.me/pau2Xa-Vs.',
			lastModified: '2020-12-10',
			showRecaptcha: true,
		},
		{
			name: 'domain-transfer',
			steps: isEnabled( 'signup/professional-email-step' )
				? [ 'user', 'domains', 'emails', 'plans' ]
				: [ 'user', 'domains', 'plans' ],
			destination: ( dependencies ) => `/domains/manage/${ dependencies.siteSlug }`,
			description:
				'Onboarding flow specifically for domain transfers. Read more in https://wp.me/pdhack-Hk.',
			lastModified: '2023-06-19',
			showRecaptcha: true,
		},
		{
			name: 'onboarding-pm',
			steps: [ 'user', 'domains', 'plans-pm' ],
			destination: getSignupDestination,
			description:
				'Paid media version of the onboarding flow. Read more in https://wp.me/pau2Xa-4Kk.',
			lastModified: '2023-07-18',
			showRecaptcha: true,
		},
		{
			name: 'onboarding-media',
			steps: [ 'user' ],
			destination: getRedirectDestination,
			description:
				'The intermittent user step for the GF foundation version of the paid media flow.',
			lastModified: '2023-06/17',
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'toStepper' ],
			optionalDependenciesInQuery: [ 'toStepper' ],
		},
		{
			name: 'import',
			steps: [ 'user', 'domains', 'plans-import' ],
			destination: ( dependencies ) =>
				`/setup/import-focused/import?siteSlug=${ dependencies.siteSlug }`,
			description: 'Beginning of the flow to import content',
			lastModified: '2022-10-03',
			showRecaptcha: true,
			get pageTitle() {
				return translate( 'Import' );
			},
		},
		{
			name: 'with-add-ons',
			steps: isEnabled( 'signup/professional-email-step' )
				? [ 'user', 'domains', 'emails', 'plans', 'add-ons' ]
				: [ 'user', 'domains', 'plans', 'add-ons' ],
			destination: getSignupDestination,
			description:
				'Copy of the onboarding flow that includes an add-ons step; the flow is used for AB testing (ExPlat) add-ons in signup',
			lastModified: '2022-07-07',
			showRecaptcha: true,
		},
		{
			name: 'onboarding-with-email',
			steps: [ 'user', 'mailbox-domain', 'mailbox', 'mailbox-plan' ],
			destination: getEmailSignupFlowDestination,
			description:
				'Copy of the onboarding flow that includes non-skippable domain and email steps; the flow is used by the Professional Email landing page',
			lastModified: '2022-09-07',
			showRecaptcha: true,
		},
		{
			name: 'onboarding-registrationless',
			steps: [ 'domains', 'plans-new', 'user-new' ],
			destination: getSignupDestination,
			description: 'Checkout without user account or site. Read more https://wp.me/pau2Xa-1hW',
			lastModified: '2020-06-26',
			showRecaptcha: true,
		},
		{
			name: 'desktop',
			steps: [ 'user' ],
			destination: getSignupDestination,
			description: 'Signup flow for desktop app',
			lastModified: '2021-03-26',
			showRecaptcha: true,
		},
		{
			name: 'pressable-nux',
			steps: [ 'creds-permission', 'creds-confirm', 'creds-complete' ],
			destination: '/stats',
			description: 'Allow new Pressable users to grant permission to server credentials',
			lastModified: '2017-11-20',
			disallowResume: true,
			hideProgressIndicator: true,
		},
		{
			name: 'rewind-switch',
			steps: [ 'rewind-migrate', 'rewind-were-backing' ],
			destination: '/activity-log',
			description:
				'Allows users with Jetpack plan with VaultPress credentials to migrate credentials',
			lastModified: '2018-01-27',
			disallowResume: true,
		},
		{
			name: 'rewind-setup',
			steps: [ 'rewind-form-creds', 'rewind-were-backing' ],
			destination: '/activity-log',
			description: 'Allows users with Jetpack plan to setup credentials',
			lastModified: '2019-11-11',
			disallowResume: true,
			forceLogin: true,
		},
		{
			name: 'rewind-auto-config',
			steps: [ 'creds-permission', 'creds-confirm', 'rewind-were-backing' ],
			destination: '/activity-log',
			description:
				'Allow users of sites that can auto-config to grant permission to server credentials',
			lastModified: '2018-02-13',
			disallowResume: true,
		},
		{
			name: 'clone-site',
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
		},
		{
			name: 'ecommerce',
			steps: [ 'user', 'domains', 'plans-ecommerce-fulfilled' ],
			destination: getSignupDestination,
			description: 'Signup flow for creating an online store with an Atomic site',
			lastModified: '2020-08-11',
			showRecaptcha: true,
		},
		{
			name: 'ecommerce-monthly',
			steps: [ 'user', 'domains', 'plans-ecommerce-monthly' ],
			destination: getSignupDestination,
			description: 'Signup flow for creating an online store with an Atomic site',
			lastModified: '2021-02-02',
			showRecaptcha: true,
		},
		{
			name: 'wpcc',
			steps: [ 'oauth2-user' ],
			destination: getRedirectDestination,
			description: 'WordPress.com Connect signup flow',
			lastModified: '2017-08-24',
			disallowResume: true, // don't allow resume so we don't clear query params when we go back in the history
			showRecaptcha: true,
		},
		{
			name: 'p2v1',
			steps: [ 'p2-site', 'p2-details', 'user' ],
			destination: ( dependencies ) => `https://${ dependencies.siteSlug }`,
			description: 'P2 signup flow',
			lastModified: '2020-09-01',
			showRecaptcha: true,
		},
		{
			name: 'videopress-account',
			steps: [ 'user' ],
			destination: getRedirectDestination,
			description: 'VideoPress onboarding signup flow',
			lastModified: '2022-10-19',
			get pageTitle() {
				return translate( 'Create an account' );
			},
			showRecaptcha: true,
		},
		{
			// When adding steps, make sure that signup campaign ref's continue to work.
			name: 'p2',
			steps: [ 'user', 'p2-confirm-email', 'p2-complete-profile', 'p2-join-workspace', 'p2-site' ],
			destination: ( dependencies ) => `https://${ dependencies.siteSlug }`,
			description: 'New P2 signup flow',
			lastModified: '2021-12-27',
			showRecaptcha: true,
		},
		{
			name: 'domain',
			steps: [ 'domain-only', 'site-or-domain', 'site-picker', 'plans-site-selected', 'user' ],
			destination: getDomainSignupFlowDestination,
			description: 'An experimental approach for WordPress.com/domains',
			disallowResume: true,
			lastModified: '2022-02-15',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'site-selected',
			steps: [ 'plans-site-selected-legacy' ],
			destination: getSignupDestination,
			providesDependenciesInQuery: [ 'siteSlug', 'siteId' ],
			description: 'A flow to test updating an existing site with `Signup`',
			lastModified: '2017-01-19',
		},
		{
			name: 'launch-site',
			steps: [ 'domains-launch', 'plans-launch', 'launch' ],
			destination: getLaunchDestination,
			description: 'A flow to launch a private site.',
			providesDependenciesInQuery: [ 'siteSlug' ],
			lastModified: '2019-11-22',
			get pageTitle() {
				return translate( 'Launch your site' );
			},
		},
		{
			name: 'reader',
			steps: [ 'reader-landing', 'user' ],
			destination: '/',
			description: 'Signup for an account and migrate email subs to the Reader.',
			lastModified: '2020-08-11',
			showRecaptcha: true,
		},
		{
			name: 'crowdsignal',
			steps: [ 'oauth2-name' ],
			destination: getRedirectDestination,
			description: "Crowdsignal's custom WordPress.com Connect signup flow",
			lastModified: '2018-11-14',
			disallowResume: true,
			showRecaptcha: true,
		},
		{
			name: 'plan-no-domain',
			steps: [ 'user', 'site', 'plans' ],
			destination: getSiteDestination,
			description: 'Allow users to select a plan without a domain',
			lastModified: '2020-08-11',
			showRecaptcha: true,
		},
		{
			name: 'launch-only',
			steps: [ 'launch' ],
			destination: getLaunchDestination,
			description:
				'Launch flow without domain or plan selected, used for sites that already have a paid plan and domain (e.g. via the launch banner in the site preview)',
			lastModified: '2020-11-30',
			get pageTitle() {
				return translate( 'Launch your site' );
			},
			providesDependenciesInQuery: [ 'siteSlug' ],
		},
		{
			name: 'business-monthly',
			steps: [ 'user', 'domains', 'plans-business-monthly' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the business monthly plan to the users cart.',
			lastModified: '2021-02-02',
			showRecaptcha: true,
		},
		{
			name: 'premium-monthly',
			steps: [ 'user', 'domains', 'plans-premium-monthly' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the premium monthly plan to the users cart.',
			lastModified: '2021-02-02',
			showRecaptcha: true,
		},
		{
			name: 'personal-monthly',
			steps: [ 'user', 'domains', 'plans-personal-monthly' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the personal monthly plan to the users cart.',
			lastModified: '2021-02-02',
			showRecaptcha: true,
		},
		{
			name: 'setup-site',
			steps: [
				'intent',
				'site-options',
				'starting-point',
				'courses',
				'store-options',
				'store-features',
				'design-setup-site',
			],
			destination: getDestinationFromIntent,
			description:
				'Sets up a site that has already been created and paid for (if purchases were made)',
			lastModified: '2021-10-14',
			providesDependenciesInQuery: [ 'siteId', 'siteSlug' ],
			optionalDependenciesInQuery: [ 'siteId' ],
			get pageTitle() {
				return translate( 'Set up your site' );
			},
			enableBranchSteps: true,
			hideProgressIndicator: true,
		},
		{
			name: 'do-it-for-me',
			steps: [
				'user',
				'new-or-existing-site',
				'difm-site-picker',
				'difm-options',
				'social-profiles',
				'difm-design-setup-site',
				'difm-page-picker',
			],
			destination: getDIFMSignupDestination,
			description: 'A flow for DIFM Lite leads',
			excludeFromManageSiteFlows: true,
			lastModified: '2022-03-10',
			enableBranchSteps: true,
		},
		{
			name: 'do-it-for-me-store',
			steps: [
				'user',
				'new-or-existing-site',
				'difm-site-picker',
				'difm-store-options',
				'social-profiles',
				'difm-design-setup-site',
				'difm-page-picker',
			],
			destination: getDIFMSignupDestination,
			description: 'The BBE store flow',
			excludeFromManageSiteFlows: true,
			lastModified: '2023-03-01',
			enableBranchSteps: true,
		},
		{
			name: 'website-design-services',
			steps: [ 'difm-options', 'social-profiles', 'difm-design-setup-site', 'difm-page-picker' ],
			destination: getDIFMSignupDestination,
			description: 'A flow for DIFM onboarding',
			excludeFromManageSiteFlows: true,
			providesDependenciesInQuery: [ 'siteSlug' ],
			lastModified: '2022-05-02',
		},

		{
			name: 'site-content-collection',
			steps: [ 'user', 'website-content' ],
			destination: getDIFMSiteContentCollectionDestination,
			description: 'A flow to collect DIFM lite site content',
			excludeFromManageSiteFlows: true,
			providesDependenciesInQuery: [ 'siteSlug' ],
			lastModified: '2022-01-21',
		},
		{
			name: 'woocommerce-install',
			get pageTitle() {
				return translate( 'Add WooCommerce to your site' );
			},
			steps: [ 'store-address', 'business-info', 'confirm', 'transfer' ],
			destination: '/',
			description: 'Onboarding and installation flow for woocommerce on all plans.',
			providesDependenciesInQuery: [ 'siteSlug', 'back_to' ],
			optionalDependenciesInQuery: [ 'back_to' ],
			lastModified: '2021-12-21',
			disallowResume: false,
		},

		{
			name: 'ecommerce-2y',
			steps: [ 'user', 'domains', 'plans-ecommerce-2y' ],
			destination: getSignupDestination,
			description: 'Signup flow for creating an online store with an Atomic site',
			lastModified: '2023-03-15',
			showRecaptcha: true,
		},

		{
			name: 'business-2y',
			steps: [ 'user', 'domains', 'plans-business-2y' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the business 2y plan to the users cart.',
			lastModified: '2023-03-15',
			showRecaptcha: true,
		},

		{
			name: 'premium-2y',
			steps: [ 'user', 'domains', 'plans-premium-2y' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the premium 2y plan to the users cart.',
			lastModified: '2023-03-15',
			showRecaptcha: true,
		},
		{
			name: 'personal-2y',
			steps: [ 'user', 'domains', 'plans-personal-2y' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the personal 2y plan to the users cart.',
			lastModified: '2023-03-15',
			showRecaptcha: true,
		},
	];

	// convert the array to an object keyed by `name`
	return Object.fromEntries( flows.map( ( flow ) => [ flow.name, flow ] ) );
}

const flows = generateFlows();
export default flows;
