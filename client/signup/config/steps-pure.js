/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
} from 'lib/plans/constants';

export function generateSteps( {
	addPlanToCart = noop,
	createAccount = noop,
	createSite = noop,
	createWpForTeamsSite = noop,
	createSiteOrDomain = noop,
	createSiteWithCart = noop,
	currentPage = noop,
	setThemeOnSite = noop,
	addDomainToCart = noop,
	launchSiteApi = noop,
	isPlanFulfilled = noop,
	isDomainFulfilled = noop,
	isSiteTypeFulfilled = noop,
	isSiteTopicFulfilled = noop,
	addOrRemoveFromProgressStore = noop,
} = {} ) {
	return {
		survey: {
			stepName: 'survey',
			props: {
				surveySiteType:
					currentPage && currentPage.toString().match( /\/start\/blog/ ) ? 'blog' : 'site',
			},
			providesDependencies: [ 'surveySiteType', 'surveyQuestion' ],
		},

		themes: {
			stepName: 'themes',
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'themeSlugWithRepo', 'useThemeHeadstart' ],
			optionalDependencies: [ 'useThemeHeadstart' ],
		},

		'portfolio-themes': {
			stepName: 'portfolio-themes',
			props: {
				designType: 'grid',
			},
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'themeSlugWithRepo' ],
		},

		'template-first-themes': {
			stepName: 'template-first-themes',
			props: {
				designType: 'template-first',
				quantity: 18,
			},
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'themeSlugWithRepo', 'useThemeHeadstart' ],
		},

		'fse-themes': {
			stepName: 'fse-themes',
			props: {
				designType: 'fse-compatible',
				quantity: 6,
			},
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'themeSlugWithRepo', 'useThemeHeadstart' ],
		},

		// `themes` does not update the theme for an existing site as we normally
		// do this when the site is created. In flows where a site is merely being
		// updated, we need to use a different API request function.
		'themes-site-selected': {
			stepName: 'themes-site-selected',
			dependencies: [ 'siteSlug', 'themeSlugWithRepo' ],
			providesDependencies: [ 'themeSlugWithRepo', 'useThemeHeadstart' ],
			apiRequestFunction: setThemeOnSite,
			props: {
				headerText: i18n.translate( 'Choose a theme for your new site.' ),
			},
		},

		'domains-launch': {
			stepName: 'domains-launch',
			apiRequestFunction: addDomainToCart,
			fulfilledStepCallback: isDomainFulfilled,
			providesDependencies: [ 'domainItem' ],
			props: {
				isDomainOnly: false,
				showExampleSuggestions: false,
				shouldShowDomainTestCopy: false,
				includeWordPressDotCom: false,
				showSkipButton: true,
				headerText: i18n.translate( 'Getting ready to launch, pick a domain' ),
				subHeaderText: i18n.translate( 'Select a domain name for your website' ),
			},
			dependencies: [ 'siteSlug' ],
		},

		'plans-site-selected': {
			stepName: 'plans-site-selected',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
		},

		site: {
			stepName: 'site',
			apiRequestFunction: createSite,
			providesDependencies: [ 'siteSlug' ],
		},

		'rebrand-cities-welcome': {
			stepName: 'rebrand-cities-welcome',
			apiRequestFunction: createSiteWithCart,
			providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem' ],
			props: {
				isDomainOnly: false,
			},
			delayApiRequestUntilComplete: true,
		},

		about: {
			stepName: 'about',
			providesDependencies: [ 'designType', 'themeSlugWithRepo', 'siteTitle', 'surveyQuestion' ],
		},

		user: {
			stepName: 'user',
			apiRequestFunction: createAccount,
			providesToken: true,
			providesDependencies: [ 'bearer_token', 'username' ],
			props: {
				isSocialSignupEnabled: config.isEnabled( 'signup/social' ),
			},
		},

		'site-title': {
			stepName: 'site-title',
			providesDependencies: [ 'siteTitle' ],
		},

		test: {
			stepName: 'test',
		},

		plans: {
			stepName: 'plans',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			fulfilledStepCallback: isPlanFulfilled,
		},

		'plans-ecommerce': {
			stepName: 'plans-ecommerce',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			fulfilledStepCallback: isPlanFulfilled,
			props: {
				hideFreePlan: true,
				planTypes: [ TYPE_BUSINESS, TYPE_ECOMMERCE ],
			},
		},

		'plans-import': {
			stepName: 'plans-import',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			fulfilledStepCallback: isPlanFulfilled,
			props: {
				planTypes: [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ],
			},
		},

		'plans-personal': {
			stepName: 'plans-personal',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			defaultDependencies: {
				cartItem: PLAN_PERSONAL,
			},
		},

		'plans-premium': {
			stepName: 'plans-premium',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			defaultDependencies: {
				cartItem: PLAN_PREMIUM,
			},
		},

		'plans-business': {
			stepName: 'plans-business',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			defaultDependencies: {
				cartItem: PLAN_BUSINESS,
			},
		},

		'plans-ecommerce-fulfilled': {
			stepName: 'plans-ecommerce-fulfilled',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			defaultDependencies: {
				cartItem: PLAN_ECOMMERCE,
			},
		},

		'plans-launch': {
			stepName: 'plans-launch',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			props: {
				headerText: i18n.translate( 'Getting ready to launch your website' ),
				subHeaderText: i18n.translate( "Pick a plan that's right for you. Upgrade as you grow." ),
				fallbackHeaderText: i18n.translate(
					"Almost there, pick a plan that's right for you. Upgrade as you grow."
				),
				isLaunchPage: true,
			},
		},

		'upsell-plan': {
			stepName: 'upsell-plan',
			fulfilledStepCallback: addOrRemoveFromProgressStore,
		},

		'plans-plan-only': {
			stepName: 'plans-plan-only',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: addOrRemoveFromProgressStore,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			props: {
				hideFreePlan: true,
				planTypes: [ TYPE_PERSONAL, TYPE_PREMIUM ],
			},
		},

		'plans-store-nux': {
			stepName: 'plans-store-nux',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug', 'domainItem' ],
			providesDependencies: [ 'cartItem' ],
		},

		'plans-with-domain': {
			stepName: 'plans-with-domain',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem', 'isPreLaunch', 'isGutenboardingCreate' ],
			props: {
				headerText: i18n.translate( 'Choose a plan' ),
				subHeaderText: i18n.translate(
					'Pick a plan that’s right for you. Switch plans as your needs change. {{br/}} There’s no risk, you can cancel for a full refund within 30 days.',
					{
						components: { br: <br /> },
						comment:
							'Subheader of the plans page where users land from onboarding after they picked a paid domain',
					}
				),
			},
		},

		domains: {
			stepName: 'domains',
			apiRequestFunction: createSiteWithCart,
			providesDependencies: [
				'siteId',
				'siteSlug',
				'domainItem',
				'themeItem',
				'shouldHideFreePlan',
			],
			optionalDependencies: [ 'shouldHideFreePlan' ],
			props: {
				isDomainOnly: false,
			},
			delayApiRequestUntilComplete: true,
		},

		'domain-only': {
			stepName: 'domain-only',
			providesDependencies: [ 'siteId', 'siteSlug', 'domainItem' ],
			props: {
				isDomainOnly: true,
				shouldShowDomainTestCopy: false,
			},
		},

		'domains-store': {
			stepName: 'domains',
			apiRequestFunction: createSiteWithCart,
			providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem' ],
			props: {
				isDomainOnly: false,
				forceDesignType: 'store',
			},
			delayApiRequestUntilComplete: true,
		},

		'domains-theme-preselected': {
			stepName: 'domains-theme-preselected',
			apiRequestFunction: createSiteWithCart,
			providesDependencies: [
				'siteId',
				'siteSlug',
				'domainItem',
				'themeItem',
				'shouldHideFreePlan',
				'useThemeHeadstart',
			],
			optionalDependencies: [ 'shouldHideFreePlan', 'useThemeHeadstart' ],
			props: {
				isDomainOnly: false,
			},
			delayApiRequestUntilComplete: true,
		},

		'jetpack-user': {
			stepName: 'jetpack-user',
			apiRequestFunction: createAccount,
			providesToken: true,
			props: {
				headerText: i18n.translate( 'Create an account for Jetpack' ),
				subHeaderText: i18n.translate( "You're moments away from connecting Jetpack." ),
			},
			providesDependencies: [ 'bearer_token', 'username' ],
		},

		'oauth2-user': {
			stepName: 'oauth2-user',
			apiRequestFunction: createAccount,
			props: {
				oauth2Signup: true,
			},
			providesToken: true,
			providesDependencies: [ 'bearer_token', 'username', 'oauth2_client_id', 'oauth2_redirect' ],
		},

		'oauth2-name': {
			stepName: 'oauth2-name',
			apiRequestFunction: createAccount,
			providesToken: true,
			providesDependencies: [ 'bearer_token', 'username', 'oauth2_client_id', 'oauth2_redirect' ],
			props: {
				isSocialSignupEnabled: config.isEnabled( 'signup/social' ),
				oauth2Signup: true,
				displayNameInput: true,
				displayUsernameInput: false,
			},
		},

		displayname: {
			stepName: 'displayname',
			apiRequestFunction: createAccount,
			providesToken: true,
			providesDependencies: [ 'bearer_token', 'username' ],
			props: {
				isSocialSignupEnabled: config.isEnabled( 'signup/social' ),
				displayNameInput: true,
				displayUsernameInput: false,
			},
		},

		// Currently, these two steps explicitly submit other steps to skip them, and
		// should not be used outside of the `domain-first` flow.
		'site-or-domain': {
			stepName: 'site-or-domain',
			props: {
				headerText: i18n.translate( 'Choose how you want to use your domain.' ),
				subHeaderText: i18n.translate(
					"Don't worry you can easily add a site later if you're not ready."
				),
			},
			providesDependencies: [
				'designType',
				'siteId',
				'siteSlug',
				'siteUrl',
				'domainItem',
				'themeSlugWithRepo',
			],
		},
		'site-picker': {
			stepName: 'site-picker',
			apiRequestFunction: createSiteOrDomain,
			props: {
				headerText: i18n.translate( 'Choose your site?' ),
			},
			providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeSlugWithRepo' ],
			dependencies: [ 'cartItem', 'designType', 'domainItem', 'siteUrl', 'themeSlugWithRepo' ],
			delayApiRequestUntilComplete: true,
		},

		'creds-complete': {
			stepName: 'creds-complete',
			providesDependencies: [],
		},

		'creds-confirm': {
			stepName: 'creds-confirm',
			providesDependencies: [ 'rewindconfig' ],
		},

		'creds-permission': {
			stepName: 'creds-permission',
			providesDependencies: [ 'rewindconfig' ],
		},

		'rewind-migrate': {
			stepName: 'rewind-migrate',
			providesDependencies: [ 'rewindconfig' ],
		},

		'rewind-were-backing': {
			stepName: 'rewind-were-backing',
			providesDependencies: [],
		},

		'rewind-form-creds': {
			stepName: 'rewind-form-creds',
			providesDependencies: [ 'rewindconfig' ],
		},

		'clone-start': {
			stepName: 'clone-start',
			providesDependencies: [ 'originSiteSlug', 'originSiteName', 'originBlogId' ],
		},

		'clone-destination': {
			stepName: 'clone-destination',
			providesDependencies: [ 'destinationSiteName', 'destinationSiteUrl' ],
		},

		'clone-credentials': {
			stepName: 'clone-credentials',
			providesDependencies: [ 'roleName' ],
		},

		'clone-point': {
			stepName: 'clone-point',
			providesDependencies: [ 'clonePoint' ],
		},

		'clone-jetpack': {
			stepName: 'clone-jetpack',
			providesDependencies: [ 'cloneJetpack' ],
		},

		'clone-ready': {
			stepName: 'clone-ready',
			providesDependencies: [],
		},

		'clone-cloning': {
			stepName: 'clone-cloning',
			providesDependencies: [],
		},

		/* Imports */
		'from-url': {
			stepName: 'from-url',
			providesDependencies: [
				'importSiteEngine',
				'importSiteFavicon',
				'importSiteUrl',
				'siteTitle',
				'suggestedDomain',
				'themeSlugWithRepo',
			],
		},

		/* Import onboarding */
		'import-url': {
			stepName: 'import-url',
			providesDependencies: [
				'importSiteEngine',
				'importSiteFavicon',
				'importSiteUrl',
				'siteTitle',
				'suggestedDomain',
				'themeSlugWithRepo',
			],
		},

		'import-preview': {
			stepName: 'import-preview',
			dependencies: [ 'importSiteEngine', 'importSiteFavicon', 'importSiteUrl', 'siteTitle' ],
		},

		'reader-landing': {
			stepName: 'reader-landing',
			providesDependencies: [],
		},

		/* Improved Onboarding */
		'site-type': {
			stepName: 'site-type',
			providesDependencies: [ 'siteType', 'themeSlugWithRepo' ],
			fulfilledStepCallback: isSiteTypeFulfilled,
		},

		'site-type-with-theme': {
			stepName: 'site-type',
			providesDependencies: [ 'siteType' ],
			fulfilledStepCallback: isSiteTypeFulfilled,
		},

		'site-topic': {
			stepName: 'site-topic',
			providesDependencies: [ 'siteTopic', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			fulfilledStepCallback: isSiteTopicFulfilled,
		},

		'site-topic-with-theme': {
			stepName: 'site-topic',
			providesDependencies: [ 'siteTopic' ],
			fulfilledStepCallback: isSiteTopicFulfilled,
		},

		'site-title-without-domains': {
			stepName: 'site-title-without-domains',
			apiRequestFunction: createSiteWithCart,
			delayApiRequestUntilComplete: true,
			dependencies: [ 'themeSlugWithRepo' ],
			providesDependencies: [ 'siteTitle', 'siteId', 'siteSlug', 'domainItem', 'themeItem' ],
			props: {
				showSiteMockups: true,
			},
		},

		'site-style': {
			stepName: 'site-style',
			providesDependencies: [ 'siteStyle', 'themeSlugWithRepo' ],
		},

		// Steps with preview
		// These can be removed once we make the preview the default
		'site-topic-with-preview': {
			stepName: 'site-topic-with-preview',
			providesDependencies: [ 'siteTopic', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			fulfilledStepCallback: isSiteTopicFulfilled,
			props: {
				showSiteMockups: true,
			},
		},

		'site-style-with-preview': {
			stepName: 'site-style-with-preview',
			providesDependencies: [ 'siteStyle', 'themeSlugWithRepo' ],
			props: {
				showSiteMockups: true,
			},
		},

		'domains-with-preview': {
			stepName: 'domains-with-preview',
			apiRequestFunction: createSiteWithCart,
			providesDependencies: [
				'siteId',
				'siteSlug',
				'domainItem',
				'themeItem',
				'shouldHideFreePlan',
			],
			optionalDependencies: [ 'shouldHideFreePlan' ],
			props: {
				showSiteMockups: true,
				isDomainOnly: false,
			},
			dependencies: [ 'themeSlugWithRepo' ],
			delayApiRequestUntilComplete: true,
		},

		'site-title-with-preview': {
			stepName: 'site-title-with-preview',
			providesDependencies: [ 'siteTitle' ],
			props: {
				showSiteMockups: true,
			},
		},

		launch: {
			stepName: 'launch',
			apiRequestFunction: launchSiteApi,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'isPreLaunch' ],
		},

		passwordless: {
			stepName: 'passwordless',
			providesToken: true,
			providesDependencies: [ 'bearer_token', 'email', 'username' ],
			unstorableDependencies: [ 'bearer_token' ],
		},

		'team-site': {
			stepName: 'team-site',
			apiRequestFunction: createWpForTeamsSite,
			providesDependencies: [ 'siteSlug' ],
		},
	};
}

const steps = generateSteps();
export default steps;
