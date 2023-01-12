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
	PLAN_WPCOM_PRO,
	PLAN_WPCOM_STARTER,
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
	addAddOnsToCart = noop,
	createAccount = noop,
	createSite = noop,
	createWpForTeamsSite = noop,
	createSiteOrDomain = noop,
	createSiteWithCart = noop,
	setDesignOnSite = noop,
	setThemeOnSite = noop,
	setOptionsOnSite = noop,
	setStoreFeatures = noop,
	setIntentOnSite = noop,
	addDomainToCart = noop,
	launchSiteApi = noop,
	isPlanFulfilled = noop,
	isAddOnsFulfilled = noop,
	isDomainFulfilled = noop,
	isSiteTypeFulfilled = noop,
	maybeRemoveStepForUserlessCheckout = noop,
	isNewOrExistingSiteFulfilled = noop,
	createSiteAndAddDIFMToCart = noop,
	excludeStepIfEmailVerified = noop,
	excludeStepIfProfileComplete = noop,
	submitWebsiteContent = noop,
} = {} ) {
	return {
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
			},
			dependencies: [ 'siteSlug' ],
		},

		'domains-link-in-bio': {
			stepName: 'domains-link-in-bio',
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
				includeWordPressDotCom: true,
				// the .link tld comes with the w.link subdomain from our partnership.
				// see pau2Xa-4tC-p2#comment-12869 for more details
				otherManagedSubdomains: [ 'link' ],
			},
			delayApiRequestUntilComplete: true,
		},

		'domains-link-in-bio-tld': {
			stepName: 'domains-link-in-bio-tld',
			apiRequestFunction: createSiteWithCart,
			dependencies: [ 'tld' ],
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
				includeWordPressDotCom: false,
				// the .link tld comes with the w.link subdomain from our partnership.
				// see pau2Xa-4tC-p2#comment-12869 for more details
				otherManagedSubdomains: [ 'link' ],
				otherManagedSubdomainsCountOverride: 2,
			},
			delayApiRequestUntilComplete: true,
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
			],
			optionalDependencies: [
				'bearer_token',
				'username',
				'marketing_price_group',
				'plans_reorder_abtest_variation',
				'allowUnauthenticated',
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
		},

		'store-features': {
			stepName: 'store-features',
			dependencies: [ 'siteSlug' ],
			apiRequestFunction: setStoreFeatures,
			providesDependencies: [ 'storeType' ],
			optionalDependencies: [ 'storeType' ],
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
			optionalDependencies: [ 'emailItem', 'themeSlugWithRepo' ],
			providesDependencies: [ 'cartItem', 'themeSlugWithRepo' ],
			fulfilledStepCallback: isPlanFulfilled,
		},

		'plans-newsletter': {
			stepName: 'plans',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug' ],
			optionalDependencies: [ 'emailItem' ],
			providesDependencies: [ 'cartItem', 'themeSlugWithRepo', 'comingSoon' ],
			fulfilledStepCallback: isPlanFulfilled,
			props: {
				themeSlugWithRepo: 'pub/lettre',
				launchSite: true,
			},
		},

		'plans-link-in-bio': {
			stepName: 'plans',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug' ],
			optionalDependencies: [ 'emailItem' ],
			providesDependencies: [ 'cartItem', 'themeSlugWithRepo' ],
			fulfilledStepCallback: isPlanFulfilled,
			props: {
				themeSlugWithRepo: 'pub/lynx',
			},
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
			providesDependencies: [ 'cartItem', 'themeSlugWithRepo' ],
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

		'plans-pro': {
			stepName: 'plans-pro',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			defaultDependencies: {
				cartItem: PLAN_WPCOM_PRO,
			},
		},

		'plans-starter': {
			stepName: 'plans-starter',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			defaultDependencies: {
				cartItem: PLAN_WPCOM_STARTER,
			},
		},

		'plans-ecommerce-fulfilled': {
			stepName: 'plans-ecommerce-fulfilled',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem', 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_ECOMMERCE,
				themeSlugWithRepo: 'pub/twentytwentytwo',
			},
		},

		'plans-launch': {
			stepName: 'plans-launch',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			props: {
				isLaunchPage: true,
			},
		},

		'plans-store-nux': {
			stepName: 'plans-store-nux',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug', 'domainItem' ],
			providesDependencies: [ 'cartItem' ],
		},

		'mailbox-plan': {
			stepName: 'mailbox-plan',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug', 'emailItem' ],
			providesDependencies: [ 'cartItem' ],
			props: {
				useEmailOnboardingSubheader: true,
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
			providesDependencies: [ 'domainItem', 'emailItem' ],
			props: {
				isDomainOnly: false,
			},
		},
		mailbox: {
			stepName: 'mailbox',
			dependencies: [ 'domainItem', 'siteSlug' ],
			providesDependencies: [ 'domainItem', 'emailItem' ],
			props: {
				backUrl: 'mailbox-domain/',
				hideSkip: true,
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

		'mailbox-domain': {
			stepName: 'mailbox-domain',
			apiRequestFunction: createSiteWithCart,
			providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem' ],
			props: {
				forceHideFreeDomainExplainerAndStrikeoutUi: true,
				get headerText() {
					return i18n.translate( 'Choose a domain for your Professional Email' );
				},
				includeWordPressDotCom: false,
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

		launch: {
			stepName: 'launch',
			apiRequestFunction: launchSiteApi,
			dependencies: [ 'siteSlug' ],
			props: {
				nonInteractive: true,
			},
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

		'p2-complete-profile': {
			stepName: 'p2-complete-profile',
			fulfilledStepCallback: excludeStepIfProfileComplete,
		},

		'p2-join-workspace': {
			stepName: 'p2-join-workspace',
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
			providesDependencies: [ 'cartItem', 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_ECOMMERCE_MONTHLY,
				themeSlugWithRepo: 'pub/twentytwentytwo',
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
			providesDependencies: [ 'selectedDesign', 'selectedSiteCategory' ],
			optionalDependencies: [ 'selectedDesign', 'selectedSiteCategory' ],
			props: {
				showDesignPickerCategories: true,
				showDesignPickerCategoriesAllFilter: true,
			},
		},

		'new-or-existing-site': {
			stepName: 'new-or-existing-site',
			fulfilledStepCallback: isNewOrExistingSiteFulfilled,
			providesDependencies: [ 'newOrExistingSiteChoice', 'forceAutoGeneratedBlogName' ],
		},

		'add-ons': {
			stepName: 'add-ons',
			props: {
				headerText: i18n.translate( 'Add-ons' ),
			},
			apiRequestFunction: addAddOnsToCart,
			fulfilledStepCallback: isAddOnsFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
		},

		'difm-site-picker': {
			stepName: 'difm-site-picker',
			props: {
				headerText: i18n.translate( 'Choose your site?' ),
			},
			providesDependencies: [
				'siteId',
				'siteSlug',
				'newOrExistingSiteChoice',
				'forceAutoGeneratedBlogName',
			],
			optionalDependencies: [
				'siteId',
				'siteSlug',
				'newOrExistingSiteChoice',
				'forceAutoGeneratedBlogName',
			],
			fulfilledStepCallback: isNewOrExistingSiteFulfilled,
		},

		'difm-design-setup-site': {
			stepName: 'difm-design-setup-site',
			apiRequestFunction: createSiteAndAddDIFMToCart,
			delayApiRequestUntilComplete: true,
			providesDependencies: [
				'selectedDesign',
				'selectedSiteCategory',
				'isLetUsChooseSelected',
				'cartItem',
				'siteSlug',
			],
			optionalDependencies: [ 'selectedDesign', 'isLetUsChooseSelected', 'cartItem', 'siteSlug' ],
			props: {
				hideSkip: true,
				hideExternalPreview: true,
				useDIFMThemes: true,
				showDesignPickerCategories: true,
				showDesignPickerCategoriesAllFilter: true,
				showLetUsChoose: true,
				hideFullScreenPreview: true,
				hideDesignTitle: true,
				hideDescription: true,
				hideBadge: true,
			},
		},
		'difm-options': {
			stepName: 'site-options',
			providesDependencies: [ 'siteTitle', 'tagline', 'newOrExistingSiteChoice' ],
			optionalDependencies: [ 'newOrExistingSiteChoice' ],
			defaultDependencies: {
				newOrExistingSiteChoice: 'existing-site',
			},
			props: {
				hideSkip: true,
			},
		},
		'difm-store-options': {
			stepName: 'site-options',
			providesDependencies: [ 'siteTitle', 'tagline', 'newOrExistingSiteChoice' ],
			optionalDependencies: [ 'newOrExistingSiteChoice' ],
			defaultDependencies: {
				newOrExistingSiteChoice: 'existing-site',
			},
			props: {
				hideSkip: true,
			},
		},
		'difm-page-picker': {
			stepName: 'difm-page-picker',
			providesDependencies: [ 'selectedPageTitles' ],
			props: {
				hideSkip: true,
			},
		},
		'social-profiles': {
			stepName: 'social-profiles',
			providesDependencies: [ 'twitterUrl', 'facebookUrl', 'linkedinUrl', 'instagramUrl' ],
		},
		'website-content': {
			stepName: 'website-content',
			dependencies: [ 'siteSlug' ],
			apiRequestFunction: submitWebsiteContent,
		},
		courses: {
			stepName: 'courses',
		},

		// Woocommerce Install steps.
		'store-address': {
			stepName: 'store-address',
			dependencies: [ 'siteSlug', 'back_to' ],
			optionalDependencies: [ 'back_to' ],
		},
		'business-info': {
			stepName: 'business-info',
			dependencies: [ 'siteSlug' ],
		},
		confirm: {
			stepName: 'confirm',
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'siteConfirmed' ],
		},
		transfer: {
			stepName: 'transfer',
			dependencies: [ 'siteSlug', 'siteConfirmed' ],
		},
	};
}

const steps = generateSteps();
export default steps;
