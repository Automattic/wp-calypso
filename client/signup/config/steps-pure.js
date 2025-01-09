import config from '@automattic/calypso-config';
import {
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM_MONTHLY,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PREMIUM_2_YEARS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PERSONAL_3_YEARS,
	PLAN_PREMIUM_3_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_ECOMMERCE,
} from '@automattic/calypso-products';
import i18n from 'i18n-calypso';

const noop = () => {};

export function generateSteps( {
	addPlanToCart = noop,
	addWithThemePlanToCart = noop,
	addWithPluginPlanToCart = noop,
	addAddOnsToCart = noop,
	createAccount = noop,
	createSite = noop,
	createWpForTeamsSite = noop,
	createSiteOrDomain = noop,
	createSiteWithCart = noop,
	setOptionsOnSite = noop,
	setStoreFeatures = noop,
	setIntentOnSite = noop,
	addDomainToCart = noop,
	launchSiteApi = noop,
	isPlanFulfilled = noop,
	maybeAddStorageAddonToCart = noop,
	isDomainFulfilled = noop,
	maybeRemoveStepForUserlessCheckout = noop,
	createSiteAndAddDIFMToCart = noop,
	excludeStepIfEmailVerified = noop,
	excludeStepIfProfileComplete = noop,
	submitWebsiteContent = noop,
	excludeSegmentSurveyStepIfInactive = noop,
} = {} ) {
	return {
		'domains-launch': {
			stepName: 'domains-launch',
			apiRequestFunction: addDomainToCart,
			fulfilledStepCallback: isDomainFulfilled,
			providesDependencies: [
				'domainItem',
				'shouldHideFreePlan',
				'signupDomainOrigin',
				'siteUrl',
				'lastDomainSearched',
				'isManageSiteFlow',
				'siteId',
				'siteSlug',
				'themeItem',
				'useThemeHeadstart',
				'domainCart',
			],
			optionalDependencies: [
				'shouldHideFreePlan',
				'signupDomainOrigin',
				'siteUrl',
				'lastDomainSearched',
				'isManageSiteFlow',
				'siteId',
				'siteSlug',
				'themeItem',
				'useThemeHeadstart',
			],
			props: {
				isDomainOnly: false,
				showExampleSuggestions: false,
				includeWordPressDotCom: false,
				showSkipButton: true,
			},
			dependencies: [ 'siteSlug' ],
		},

		'plans-site-selected': {
			stepName: 'plans-site-selected',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			props: {
				deemphasizeFreePlan: true,
				hideEnterprisePlan: true,
				isCustomDomainAllowedOnFreePlan: true,
			},
		},

		// TODO
		// The new pricing grid and the legacy one act differently
		// when a paid domain is picked, and the new pricing grid is currently
		// having different behavior on different flow on the paid domain +
		// Free plan case. We can deprecate this once that specific behavior
		// is settled and that we decide to migrate `site-selected` as a reskinned flow.
		'plans-site-selected-legacy': {
			stepName: 'plans-site-selected-legacy',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			props: {
				intent: 'plans-site-selected-legacy',
				deemphasizeFreePlan: true,
			},
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
				'redirect',
				'allowUnauthenticated',
				'is_new_account',
				'oauth2_client_id',
				'oauth2_redirect',
			],
			optionalDependencies: [
				'redirect',
				'allowUnauthenticated',
				'is_new_account',
				'oauth2_client_id',
				'oauth2_redirect',
			],
			props: {
				isSocialSignupEnabled: config.isEnabled( 'signup/social' ),
			},
		},

		'user-social': {
			stepName: 'user-social',
			apiRequestFunction: createAccount,
			providesToken: true,
			providesDependencies: [
				'bearer_token',
				'username',
				'marketing_price_group',
				'redirect',
				'allowUnauthenticated',
				'is_new_account',
				'oauth2_client_id',
				'oauth2_redirect',
			],
			optionalDependencies: [
				'redirect',
				'allowUnauthenticated',
				'is_new_account',
				'oauth2_client_id',
				'oauth2_redirect',
			],
			props: {
				isSocialFirst: true,
				isSocialSignupEnabled: true,
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
				'allowUnauthenticated',
				'is_new_account',
				'redirect',
				'oauth2_client_id',
				'oauth2_redirect',
			],
			optionalDependencies: [
				'bearer_token',
				'username',
				'marketing_price_group',
				'allowUnauthenticated',
				'is_new_account',
				'redirect',
				'oauth2_client_id',
				'oauth2_redirect',
			],
			props: {
				isSocialSignupEnabled: config.isEnabled( 'signup/social' ),
			},
		},

		'site-options': {
			stepName: 'site-options',
			dependencies: [ 'siteSlug', 'siteTitle', 'tagline' ],
			providesDependencies: [ 'siteTitle', 'tagline', 'searchTerms', 'newOrExistingSiteChoice' ],
			optionalDependencies: [ 'searchTerms', 'newOrExistingSiteChoice' ],
			apiRequestFunction: setOptionsOnSite,
			delayApiRequestUntilComplete: true,
		},

		'store-options': {
			stepName: 'store-options',
			dependencies: [ 'siteSlug', 'siteTitle', 'tagline' ],
			providesDependencies: [ 'siteTitle', 'tagline', 'searchTerms', 'newOrExistingSiteChoice' ],
			optionalDependencies: [ 'searchTerms', 'newOrExistingSiteChoice' ],
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

		plans: {
			stepName: 'plans',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug' ],
			optionalDependencies: [ 'emailItem', 'themeSlugWithRepo' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			fulfilledStepCallback: isPlanFulfilled,
		},

		'plans-theme-preselected': {
			stepName: 'plans-theme-preselected',
			apiRequestFunction: addWithThemePlanToCart,
			dependencies: [ 'siteSlug', 'theme' ],
			optionalDependencies: [ 'emailItem', 'themeSlugWithRepo' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			fulfilledStepCallback: isPlanFulfilled,
		},
		'hosting-decider': {
			stepName: 'hosting-decider',
			providesDependencies: [ 'stepperHostingFlow' ],
		},

		'plans-new': {
			stepName: 'plans',
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			fulfilledStepCallback: isPlanFulfilled,
		},

		'plans-import': {
			stepName: 'plans-import',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			fulfilledStepCallback: isPlanFulfilled,
			props: {
				intent: 'plans-import',
			},
		},

		'plans-personal': {
			stepName: 'plans-personal',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_PERSONAL,
			},
		},

		'plans-premium': {
			stepName: 'plans-premium',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_PREMIUM,
			},
		},

		'plans-business': {
			stepName: 'plans-business',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_BUSINESS,
			},
		},

		'plans-business-with-plugin': {
			stepName: 'plans-business-with-plugin',
			apiRequestFunction: addWithPluginPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug', 'plugin', 'billing_period' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_BUSINESS,
			},
		},

		'plans-ecommerce-fulfilled': {
			stepName: 'plans-ecommerce-fulfilled',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
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
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			props: {
				isLaunchPage: true,
			},
		},

		'plans-affiliate': {
			stepName: 'plans-affiliate',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug' ],
			optionalDependencies: [ 'emailItem', 'themeSlugWithRepo' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			fulfilledStepCallback: isPlanFulfilled,
			props: {
				intent: 'plans-affiliate',
			},
		},

		'mailbox-plan': {
			stepName: 'mailbox-plan',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug', 'emailItem' ],
			providesDependencies: [ 'themeSlugWithRepo', 'cartItems' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			props: {
				useEmailOnboardingSubheader: true,
				hideFreePlan: true,
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
				'signupDomainOrigin',
				'siteUrl',
				'lastDomainSearched',
				'useThemeHeadstart',
				'domainCart',
			],
			optionalDependencies: [
				'shouldHideFreePlan',
				'isManageSiteFlow',
				'signupDomainOrigin',
				'siteUrl',
				'lastDomainSearched',
				'useThemeHeadstart',
			],
			props: {
				isDomainOnly: false,
			},
			delayApiRequestUntilComplete: true,
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
			providesDependencies: [
				'siteId',
				'siteSlug',
				'siteUrl',
				'domainItem',
				'signupDomainOrigin',
				'lastDomainSearched',
				'isManageSiteFlow',
				'shouldHideFreePlan',
				'themeItem',
				'useThemeHeadstart',
				'domainCart',
			], // note: siteId, siteSlug are not provided when used in domain flow
			optionalDependencies: [
				'signupDomainOrigin',
				'siteUrl',
				'lastDomainSearched',
				'isManageSiteFlow',
				'shouldHideFreePlan',
				'themeItem',
				'useThemeHeadstart',
			],
			props: {
				isDomainOnly: true,
				forceHideFreeDomainExplainerAndStrikeoutUi: true,
			},
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
				'signupDomainOrigin',
				'siteUrl',
				'lastDomainSearched',
				'isManageSiteFlow',
				'domainCart',
			],
			optionalDependencies: [
				'shouldHideFreePlan',
				'useThemeHeadstart',
				'signupDomainOrigin',
				'siteUrl',
				'lastDomainSearched',
				'isManageSiteFlow',
			],
			props: {
				isDomainOnly: false,
			},
			delayApiRequestUntilComplete: true,
		},

		'mailbox-domain': {
			stepName: 'mailbox-domain',
			apiRequestFunction: createSiteWithCart,
			providesDependencies: [
				'siteId',
				'siteSlug',
				'domainItem',
				'themeItem',
				'signupDomainOrigin',
				'isManageSiteFlow',
				'lastDomainSearched',
				'shouldHideFreePlan',
				'siteUrl',
				'useThemeHeadstart',
				'domainCart',
			],
			optionalDependencies: [
				'signupDomainOrigin',
				'isManageSiteFlow',
				'lastDomainSearched',
				'shouldHideFreePlan',
				'siteUrl',
				'useThemeHeadstart',
			],
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
				'allowUnauthenticated',
				'is_new_account',
				'redirect',
			],
			optionalDependencies: [ 'allowUnauthenticated', 'redirect', 'is_new_account' ],
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
				'allowUnauthenticated',
				'is_new_account',
				'redirect',
			],
			optionalDependencies: [ 'allowUnauthenticated', 'redirect', 'is_new_account' ],
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
				getHeaderText( domainCart ) {
					return i18n.translate(
						'Choose how to use your domain',
						'Choose how to use your domains',
						{
							count: domainCart.length,
						}
					);
				},
				get subHeaderText() {
					return i18n.translate( 'Don’t worry, you can easily change it later.' );
				},
			},
			providesDependencies: [
				'designType',
				'siteId',
				'siteSlug',
				'siteUrl',
				'domainItem',
				'themeSlugWithRepo',
				'domainCart',
			],
			defaultDependencies: {
				themeSlugWithRepo: 'pub/twentytwentytwo',
			},
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
			dependencies: [ 'designType', 'domainItem', 'siteUrl', 'themeSlugWithRepo', 'domainCart' ],
			delayApiRequestUntilComplete: true,
		},

		'creds-confirm': {
			stepName: 'creds-confirm',
			providesDependencies: [ 'rewindconfig' ],
		},

		'creds-permission': {
			stepName: 'creds-permission',
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

		'clone-ready': {
			stepName: 'clone-ready',
			providesDependencies: [],
		},

		'clone-cloning': {
			stepName: 'clone-cloning',
			providesDependencies: [],
		},

		'reader-landing': {
			stepName: 'reader-landing',
			providesDependencies: [],
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
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_PERSONAL_MONTHLY,
			},
		},

		'plans-premium-monthly': {
			stepName: 'plans-premium-monthly',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_PREMIUM_MONTHLY,
			},
		},

		'plans-business-monthly': {
			stepName: 'plans-business-monthly',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_BUSINESS_MONTHLY,
			},
		},

		'plans-ecommerce-monthly': {
			stepName: 'plans-ecommerce-monthly',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_ECOMMERCE_MONTHLY,
				themeSlugWithRepo: 'pub/twentytwentytwo',
			},
		},

		'plans-personal-2y': {
			stepName: 'plans-personal-2y',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_PERSONAL_2_YEARS,
			},
		},

		'plans-premium-2y': {
			stepName: 'plans-premium-2y',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_PREMIUM_2_YEARS,
			},
		},

		'plans-business-2y': {
			stepName: 'plans-business-2y',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_BUSINESS_2_YEARS,
			},
		},
		'plans-personal-3y': {
			stepName: 'plans-personal-3y',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_PERSONAL_3_YEARS,
			},
		},
		'plans-premium-3y': {
			stepName: 'plans-premium-3y',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_PREMIUM_3_YEARS,
			},
		},

		'plans-business-3y': {
			stepName: 'plans-business-3y',
			apiRequestFunction: addPlanToCart,
			fulfilledStepCallback: isPlanFulfilled,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItems', 'themeSlugWithRepo' ],
			optionalDependencies: [ 'themeSlugWithRepo' ],
			defaultDependencies: {
				cartItem: PLAN_BUSINESS_3_YEARS,
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

		'new-or-existing-site': {
			stepName: 'new-or-existing-site',
			providesDependencies: [ 'newOrExistingSiteChoice', 'forceAutoGeneratedBlogName' ],
		},

		'storage-addon': {
			stepName: 'storage-addon',
			apiRequestFunction: addAddOnsToCart,
			fulfilledStepCallback: maybeAddStorageAddonToCart,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
			optionalDependencies: [ 'cartItem' ],
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
			providesDependencies: [ 'siteTitle', 'tagline', 'searchTerms', 'newOrExistingSiteChoice' ],
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
			providesDependencies: [ 'siteTitle', 'tagline', 'searchTerms', 'newOrExistingSiteChoice' ],
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
		'initial-intent': {
			stepName: 'initial-intent',
			fulfilledStepCallback: excludeSegmentSurveyStepIfInactive,
			providesDependencies: [
				'segmentationSurveyAnswers',
				'onboardingSegment',
				'trailMapExperimentVariant',
			],
		},
	};
}

const steps = generateSteps();
export default steps;
