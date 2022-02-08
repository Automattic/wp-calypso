import config from '@automattic/calypso-config';
import {
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM_MONTHLY,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE_MONTHLY,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
} from '@automattic/calypso-products';
import i18n from 'i18n-calypso';

const noop = () => {};

export function generateSteps( {
	addPlanToCart = noop,
	createAccount = noop,
	createSite = noop,
	createWpForTeamsSite = noop,
	createSiteOrDomain = noop,
	createSiteWithCart = noop,
	currentPage = noop,
	setDesignOnSite = noop,
	setThemeOnSite = noop,
	setOptionsOnSite = noop,
	getSiteFeatures = noop,
	setIntentOnSite = noop,
	addDomainToCart = noop,
	launchSiteApi = noop,
	isPlanFulfilled = noop,
	isDomainFulfilled = noop,
	isSiteTypeFulfilled = noop,
	isSiteTopicFulfilled = noop,
	maybeRemoveStepForUserlessCheckout = noop,
	isNewOrExistingSiteFulfilled = noop,
	setDesignIfNewSite = noop,
	excludeStepIfEmailVerified = noop,
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

		// `themes` does not update the theme for an existing site as we normally
		// do this when the site is created. In flows where a site is merely being
		// updated, we need to use a different API request function.
		'themes-site-selected': {
			stepName: 'themes-site-selected',
			dependencies: [ 'siteSlug', 'themeSlugWithRepo' ],
			providesDependencies: [ 'themeSlugWithRepo', 'useThemeHeadstart' ],
			apiRequestFunction: setThemeOnSite,
			props: {
				get headerText() {
					return i18n.translate( 'Choose a theme for your new site.' );
				},
			},
		},

		'domains-launch': {
			stepName: 'domains-launch',
			apiRequestFunction: addDomainToCart,
			fulfilledStepCallback: isDomainFulfilled,
			providesDependencies: [ 'domainItem', 'shouldHideFreePlan' ],
			optionalDependencies: [ 'shouldHideFreePlan' ],
			props: {
				isDomainOnly: false,
				showExampleSuggestions: false,
				includeWordPressDotCom: false,
				showSkipButton: true,
				get headerText() {
					return i18n.translate( 'Getting ready to launch, pick a domain' );
				},
				get subHeaderText() {
					return i18n.translate( 'Select a domain name for your website' );
				},
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

		about: {
			stepName: 'about',
			providesDependencies: [ 'designType', 'themeSlugWithRepo', 'siteTitle', 'surveyQuestion' ],
		},

		user: {
			stepName: 'user',
			apiRequestFunction: createAccount,
			providesToken: true,
			providesDependencies: [
				'bearer_token',
				'username',
				'marketing_price_group',
				'plans_reorder_abtest_variation',
				'redirect',
				'user_id',
			],
			optionalDependencies: [ 'plans_reorder_abtest_variation', 'redirect' ],
			props: {
				isSocialSignupEnabled: config.isEnabled( 'signup/social' ),
			},
		},

		'user-new': {
			stepName: 'user-new',
			apiRequestFunction: createAccount,
			fulfilledStepCallback: maybeRemoveStepForUserlessCheckout,
			providesToken: true,
			dependencies: [ 'cartItem', 'domainItem' ],
			providesDependencies: [
				'bearer_token',
				'username',
				'marketing_price_group',
				'plans_reorder_abtest_variation',
				'allowUnauthenticated',
				'user_id',
			],
			optionalDependencies: [
				'bearer_token',
				'username',
				'marketing_price_group',
				'plans_reorder_abtest_variation',
				'allowUnauthenticated',
				'user_id',
			],
			props: {
				isSocialSignupEnabled: config.isEnabled( 'signup/social' ),
			},
		},

		'site-title': {
			stepName: 'site-title',
			providesDependencies: [ 'siteTitle' ],
		},

		'site-options': {
			stepName: 'site-options',
			dependencies: [ 'siteSlug', 'siteTitle', 'tagline' ],
			providesDependencies: [ 'siteTitle', 'tagline' ],
			apiRequestFunction: setOptionsOnSite,
			delayApiRequestUntilComplete: true,
		},

		'store-options': {
			stepName: 'store-options',
			dependencies: [ 'siteSlug', 'siteTitle', 'tagline' ],
			providesDependencies: [ 'siteTitle', 'tagline' ],
			apiRequestFunction: setOptionsOnSite,
			delayApiRequestUntilComplete: true,
		},

		'store-features': {
			stepName: 'store-features',
			dependencies: [ 'siteSlug' ],
			apiRequestFunction: getSiteFeatures,
			delayApiRequestUntilComplete: true,
			providesDependencies: [ 'isFSEActive' ],
			optionalDependencies: [ 'isFSEActive' ],
		},

		'starting-point': {
			stepName: 'starting-point',
			providesDependencies: [ 'startingPoint' ],
			optionalDependencies: [ 'startingPoint' ],
		},

		test: {
			stepName: 'test',
		},

		plans: {
			stepName: 'plans',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug' ],
			optionalDependencies: [ 'emailItem' ],
			providesDependencies: [ 'cartItem' ],
			fulfilledStepCallback: isPlanFulfilled,
		},

		'plans-new': {
			stepName: 'plans',
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
				get headerText() {
					return i18n.translate( 'Getting ready to launch your website' );
				},
				get subHeaderText() {
					return i18n.translate( "Pick a plan that's right for you. Upgrade as you grow." );
				},
				isLaunchPage: true,
			},
		},

		'plans-store-nux': {
			stepName: 'plans-store-nux',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug', 'domainItem' ],
			providesDependencies: [ 'cartItem' ],
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
				'isManageSiteFlow',
			],
			optionalDependencies: [ 'shouldHideFreePlan', 'isManageSiteFlow' ],
			props: {
				isDomainOnly: false,
			},
			delayApiRequestUntilComplete: true,
		},
		emails: {
			stepName: 'emails',
			dependencies: [ 'domainItem', 'siteSlug' ],
			providesDependencies: [ 'domainItem', 'emailItem', 'shouldHideFreePlan' ],
			props: {
				isDomainOnly: false,
			},
		},
		'domain-only': {
			stepName: 'domain-only',
			providesDependencies: [ 'siteId', 'siteSlug', 'siteUrl', 'domainItem' ], // note: siteId, siteSlug are not provided when used in domain flow
			props: {
				isDomainOnly: true,
				forceHideFreeDomainExplainerAndStrikeoutUi: true,
			},
		},

		'select-domain': {
			stepName: 'select-domain',
			providesDependencies: [ 'siteId', 'siteSlug', 'domainItem' ], // note: siteId, siteSlug are not provided when used in add-domain flow
			props: {
				isAllDomains: true,
				isDomainOnly: true,
				forceHideFreeDomainExplainerAndStrikeoutUi: true,
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
				'useThemeHeadstart',
				'shouldHideFreePlan',
			],
			optionalDependencies: [ 'shouldHideFreePlan', 'useThemeHeadstart' ],
			props: {
				isDomainOnly: false,
			},
			delayApiRequestUntilComplete: true,
		},

		'oauth2-user': {
			stepName: 'oauth2-user',
			apiRequestFunction: createAccount,
			props: {
				oauth2Signup: true,
			},
			providesToken: true,
			providesDependencies: [
				'bearer_token',
				'username',
				'oauth2_client_id',
				'oauth2_redirect',
				'marketing_price_group',
				'plans_reorder_abtest_variation',
				'user_id',
			],
			optionalDependencies: [ 'plans_reorder_abtest_variation' ],
		},

		'oauth2-name': {
			stepName: 'oauth2-name',
			apiRequestFunction: createAccount,
			providesToken: true,
			providesDependencies: [
				'bearer_token',
				'username',
				'oauth2_client_id',
				'oauth2_redirect',
				'marketing_price_group',
				'plans_reorder_abtest_variation',
				'user_id',
			],
			optionalDependencies: [ 'plans_reorder_abtest_variation' ],
			props: {
				isSocialSignupEnabled: config.isEnabled( 'signup/social' ),
				oauth2Signup: true,
				displayNameInput: true,
				displayUsernameInput: false,
			},
		},

		// Currently, these two steps explicitly submit other steps to skip them, and
		// should not be used outside of the `domain-first` flow.
		'site-or-domain': {
			stepName: 'site-or-domain',
			props: {
				get headerText() {
					return i18n.translate( 'Choose how to use your domain' );
				},
				get subHeaderText() {
					return i18n.translate( 'Don’t worry, you can easily add a site later' );
				},
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
				get headerText() {
					return i18n.translate( 'Choose your site' );
				},
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

		'reader-landing': {
			stepName: 'reader-landing',
			providesDependencies: [],
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

		launch: {
			stepName: 'launch',
			apiRequestFunction: launchSiteApi,
			dependencies: [ 'siteSlug' ],
			props: {
				nonInteractive: true,
			},
		},

		passwordless: {
			stepName: 'passwordless',
			providesToken: true,
			providesDependencies: [ 'bearer_token', 'email', 'username' ],
			unstorableDependencies: [ 'bearer_token' ],
		},

		'p2-details': {
			stepName: 'p2-details',
		},

		'p2-site': {
			stepName: 'p2-site',
			apiRequestFunction: createWpForTeamsSite,
			providesDependencies: [ 'siteSlug' ],
		},

		'p2-get-started': {
			stepName: 'p2-get-started',
		},

		'p2-confirm-email': {
			stepName: 'p2-confirm-email',
			fulfilledStepCallback: excludeStepIfEmailVerified,
		},

		'plans-personal-monthly': {
			stepName: 'plans-personal-monthly',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			defaultDependencies: {
				cartItem: PLAN_PERSONAL_MONTHLY,
			},
		},

		'plans-premium-monthly': {
			stepName: 'plans-premium-monthly',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			defaultDependencies: {
				cartItem: PLAN_PREMIUM_MONTHLY,
			},
		},

		'plans-business-monthly': {
			stepName: 'plans-business-monthly',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			defaultDependencies: {
				cartItem: PLAN_BUSINESS_MONTHLY,
			},
		},

		'plans-ecommerce-monthly': {
			stepName: 'plans-ecommerce-monthly',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			defaultDependencies: {
				cartItem: PLAN_ECOMMERCE_MONTHLY,
			},
		},

		intent: {
			stepName: 'intent',
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'intent' ],
			optionalDependencies: [ 'intent' ],
			apiRequestFunction: setIntentOnSite,
			delayApiRequestUntilComplete: true,
		},

		'design-setup-site': {
			stepName: 'design-setup-site',
			apiRequestFunction: setDesignOnSite,
			delayApiRequestUntilComplete: true,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'isFSEActive', 'selectedDesign', 'selectedSiteCategory' ],
			optionalDependencies: [ 'isFSEActive', 'selectedDesign', 'selectedSiteCategory' ],
			props: {
				showDesignPickerCategories: config.isEnabled( 'signup/design-picker-categories' ),
				showDesignPickerCategoriesAllFilter: config.isEnabled( 'signup/design-picker-categories' ),
			},
		},

		'new-or-existing-site': {
			stepName: 'new-or-existing-site',
			fulfilledStepCallback: isNewOrExistingSiteFulfilled,
			providesDependencies: [ 'newOrExistingSiteChoice' ],
		},

		'difm-site-picker': {
			stepName: 'difm-site-picker',
			props: {
				headerText: i18n.translate( 'Choose your site?' ),
			},
			providesDependencies: [ 'siteId', 'siteSlug' ],
			optionalDependencies: [ 'siteId', 'siteSlug' ],
			fulfilledStepCallback: isNewOrExistingSiteFulfilled,
		},

		'difm-design-setup-site': {
			stepName: 'difm-design-setup-site',
			apiRequestFunction: setDesignIfNewSite,
			delayApiRequestUntilComplete: true,
			dependencies: [ 'siteSlug', 'newOrExistingSiteChoice' ],
			providesDependencies: [
				'isFSEActive',
				'selectedDesign',
				'selectedSiteCategory',
				'isLetUsChooseSelected',
			],
			optionalDependencies: [ 'isFSEActive', 'selectedDesign', 'isLetUsChooseSelected' ],
			props: {
				hideSkip: true,
				hideExternalPreview: true,
				useDIFMThemes: true,
				showDesignPickerCategories: true,
				showDesignPickerCategoriesAllFilter: false,
				showLetUsChoose: true,
				hideFullScreenPreview: true,
				hideDesignTitle: true,
			},
		},
		'site-info-collection': {
			stepName: 'site-info-collection',
			dependencies: [ 'siteSlug', 'selectedDesign', 'newOrExistingSiteChoice' ],
			providesDependencies: [ 'cartItem', 'typeformResponseId' ],
			apiRequestFunction: addPlanToCart,
			delayApiRequestUntilComplete: true,
		},
		courses: {
			stepName: 'courses',
		},

		// ↓ importer steps
		list: {
			stepName: 'list',
		},
		capture: {
			stepName: 'capture',
		},
		ready: {
			stepName: 'ready',
		},
		importing: {
			stepName: 'importing',
		},

		// Woocommerce Install steps.
		'store-address': {
			stepName: 'store-address',
			dependencies: [ 'site' ],
		},
		'business-info': {
			stepName: 'business-info',
			dependencies: [ 'site' ],
		},
		confirm: {
			stepName: 'confirm',
			dependencies: [ 'site' ],
			providesDependencies: [ 'siteConfirmed' ],
		},
		transfer: {
			stepName: 'transfer',
			dependencies: [ 'site', 'siteConfirmed' ],
		},
	};
}

const steps = generateSteps();
export default steps;
