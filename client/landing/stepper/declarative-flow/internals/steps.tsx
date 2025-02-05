import { StepperStep } from './types';

export const STEPS = {
	BLOGGER_STARTING_POINT: {
		slug: 'bloggerStartingPoint',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-blogger-starting-point' */ './steps-repository/blogger-starting-point'
			),
	},

	BUSINESS_INFO: {
		slug: 'businessInfo',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-business-info' */ './steps-repository/business-info'
			),
	},

	CELEBRATION: {
		slug: 'celebration-step',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-celebration-step' */ './steps-repository/celebration-step'
			),
	},

	CHECK_SITES: {
		slug: 'check-sites',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-sites-checker' */ './steps-repository/sites-checker'
			),
	},

	COURSES: {
		slug: 'courses',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-courses' */ './steps-repository/courses' ),
	},

	DESIGN_CHOICES: {
		slug: 'design-choices',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-design-choices' */ './steps-repository/design-choices'
			),
	},

	DESIGN_SETUP: {
		slug: 'designSetup',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-design-setup' */ './steps-repository/design-setup' ),
	},

	DIFM_STARTING_POINT: {
		slug: 'difmStartingPoint',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-difm-starting-point' */ './steps-repository/difm-starting-point'
			),
	},

	DOMAINS: {
		slug: 'domains',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-domains' */ './steps-repository/domains' ),
	},

	ERROR: {
		slug: 'error',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-error-step' */ './steps-repository/error-step' ),
	},

	MIGRATION_ERROR: {
		slug: 'error',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-migration-error' */ './steps-repository/migration-error'
			),
	},

	NEWSLETTER_SETUP: {
		slug: 'newsletterSetup',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-newsletter-setup' */ './steps-repository/newsletter-setup'
			),
	},

	NEWSLETTER_GOALS: {
		slug: 'newsletterGoals',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-newsletter-goals' */ './steps-repository/newsletter-goals'
			),
	},

	SUBSCRIBERS: {
		slug: 'subscribers',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-subscribers' */ './steps-repository/subscribers' ),
	},

	FREE_POST_SETUP: {
		slug: 'freePostSetup',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-free-post-setup' */ './steps-repository/free-post-setup'
			),
	},

	GOALS: {
		slug: 'goals',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-goals' */ './steps-repository/goals' ),
	},

	GENERATE_CONTENT: {
		slug: 'generateContent',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-readymade-template-generate-content' */ './steps-repository/readymade-template-generate-content'
			),
	},

	IMPORT: {
		slug: 'import',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-import' */ './steps-repository/import' ),
	},

	IMPORT_LIGHT: {
		slug: 'importLight',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-import-light' */ './steps-repository/import-light' ),
	},

	IMPORT_LIST: {
		slug: 'importList',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-import-list' */ './steps-repository/import-list' ),
	},

	IMPORT_READY: {
		slug: 'importReady',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-import-ready' */ './steps-repository/import-ready' ),
	},

	IMPORT_READY_NOT: {
		slug: 'importReadyNot',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-import-ready-not' */ './steps-repository/import-ready-not'
			),
	},

	IMPORT_READY_PREVIEW: {
		slug: 'importReadyPreview',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-import-ready-preview' */ './steps-repository/import-ready-preview'
			),
	},

	IMPORT_READY_WPCOM: {
		slug: 'importReadyWpcom',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-import-ready-wpcom' */ './steps-repository/import-ready-wpcom'
			),
	},

	IMPORTER_BLOGGER: {
		slug: 'importerBlogger',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-importer-blogger' */ './steps-repository/importer-blogger'
			),
	},

	IMPORTER_MEDIUM: {
		slug: 'importerMedium',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-importer-medium' */ './steps-repository/importer-medium'
			),
	},

	IMPORTER_SQUARESPACE: {
		slug: 'importerSquarespace',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-importer-squarespace' */ './steps-repository/importer-squarespace'
			),
	},

	IMPORTER_WIX: {
		slug: 'importerWix',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-importer-wix' */ './steps-repository/importer-wix' ),
	},

	IMPORTER_WORDPRESS: {
		slug: 'importerWordpress',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-importer-wordpress' */ './steps-repository/importer-wordpress'
			),
	},

	INTENT: {
		slug: 'intent',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-intent-step' */ './steps-repository/intent-step' ),
	},

	INTRO: {
		slug: 'intro',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-intro' */ './steps-repository/intro' ),
	},

	NEW_OR_EXISTING_SITE: {
		slug: 'new-or-existing-site',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-new-or-existing-site' */ './steps-repository/new-or-existing-site'
			),
	},

	LAUNCH_BIG_SKY: {
		slug: 'launch-big-sky',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-launch-big-sky' */ './steps-repository/launch-big-sky'
			),
	},

	LAUNCHPAD: {
		slug: 'launchpad',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-launchpad' */ './steps-repository/launchpad' ),
	},
	MIGRATION_HANDLER: {
		slug: 'migrationHandler',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-migration-handler' */ './steps-repository/migration-handler'
			),
	},

	OPTIONS: {
		slug: 'options',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-site-options' */ './steps-repository/site-options' ),
	},

	PLANS: {
		slug: 'plans',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-plans' */ './steps-repository/plans' ),
	},

	PROCESSING: {
		slug: 'processing',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-processing-step' */ './steps-repository/processing-step'
			),
	},

	SITE_CREATION_STEP: {
		slug: 'create-site',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-create-site' */ './steps-repository/create-site' ),
	},

	SITE_LAUNCH: {
		slug: 'site-launch',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-site-launch' */ './steps-repository/site-launch' ),
	},

	SITE_PICKER: {
		slug: 'site-picker',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-picker-list' */ './steps-repository/site-picker-list'
			),
	},

	STORE_ADDRESS: {
		slug: 'storeAddress',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-store-address' */ './steps-repository/store-address'
			),
	},

	TRIAL_ACKNOWLEDGE: {
		slug: 'trialAcknowledge',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-trial-acknowledge' */ './steps-repository/trial-acknowledge'
			),
	},

	VERIFY_EMAIL: {
		slug: 'verifyEmail',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-import-verify-email' */ './steps-repository/import-verify-email'
			),
	},

	BUNDLE_CONFIRM: {
		slug: 'bundleConfirm',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-bundle-confirm' */ './steps-repository/bundle-confirm'
			),
	},

	BUNDLE_INSTALL_PLUGINS: {
		slug: 'bundleInstallPlugins',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-bundle-install-plugins' */ './steps-repository/bundle-install-plugins'
			),
	},

	BUNDLE_TRANSFER: {
		slug: 'bundleTransfer',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-bundle-transfer' */ './steps-repository/bundle-transfer'
			),
	},

	WAIT_FOR_ATOMIC: {
		slug: 'waitForAtomic',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-wait-for-atomic' */ './steps-repository/wait-for-atomic'
			),
	},

	WAIT_FOR_PLUGIN_INSTALL: {
		slug: 'waitForPluginInstall',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-wait-for-plugin-install' */ './steps-repository/wait-for-plugin-install'
			),
	},

	ASSIGN_TRIAL_PLAN: {
		slug: 'assignTrialPlan',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-assign-trial-plan' */ './steps-repository/assign-trial-plan'
			),
	},

	SITE_MIGRATION_ASSIGN_TRIAL_PLAN: {
		slug: 'site-migration-assign-trial-plan',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-assign-trial-plan' */ './steps-repository/site-migration-assign-trial-plan'
			),
	},

	SITE_MIGRATION_INSTRUCTIONS: {
		slug: 'site-migration-instructions',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-instructions' */ './steps-repository/site-migration-instructions'
			),
	},

	SITE_MIGRATION_STARTED: {
		slug: 'site-migration-started',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-started' */ './steps-repository/site-migration-started'
			),
	},

	SITE_MIGRATION_ASSISTED_MIGRATION: {
		slug: 'migrateMessage',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-importer-migrate-message' */ './steps-repository/importer-migrate-message'
			),
	},

	SITE_MIGRATION_CREDENTIALS: {
		slug: 'site-migration-credentials',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-credentials' */ './steps-repository/site-migration-credentials'
			),
	},

	SITE_MIGRATION_FALLBACK_CREDENTIALS: {
		slug: 'site-migration-fallback-credentials',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-fallback-credentials' */ './steps-repository/site-migration-fallback-credentials'
			),
	},

	SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION: {
		slug: 'site-migration-application-password-authorization',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-application-password-authorization' */ './steps-repository/site-migration-application-password-authorization'
			),
	},

	SITE_MIGRATION_IDENTIFY: {
		slug: 'site-migration-identify',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-identify' */ './steps-repository/site-migration-identify'
			),
	},

	SITE_MIGRATION_IMPORT_OR_MIGRATE: {
		slug: 'site-migration-import-or-migrate',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-import-or-migrate' */ './steps-repository/site-migration-import-or-migrate'
			),
	},

	SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT: {
		slug: 'other-platform-detected',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-other-platform-detected-import' */ './steps-repository/site-migration-other-platform-detected-import'
			),
	},

	SITE_MIGRATION_HOW_TO_MIGRATE: {
		slug: 'site-migration-how-to-migrate',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-how-to-migrate' */ './steps-repository/site-migration-how-to-migrate'
			),
	},

	SITE_MIGRATION_SOURCE_URL: {
		slug: 'site-migration-source-url',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-source-url' */ './steps-repository/site-migration-source-url'
			),
	},

	SITE_MIGRATION_UPGRADE_PLAN: {
		slug: 'site-migration-upgrade-plan',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-upgrade-plan' */ './steps-repository/site-migration-upgrade-plan'
			),
	},

	SITE_MIGRATION_PLUGIN_INSTALL: {
		slug: 'site-migration-plugin-install',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-plugin-install' */ './steps-repository/site-migration-plugin-install'
			),
	},

	SITE_MIGRATION_ALREADY_WPCOM: {
		slug: 'already-wpcom',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-already-wpcom' */ './steps-repository/site-migration-already-wpcom'
			),
	},
	SITE_MIGRATION_SUPPORT_INSTRUCTIONS: {
		slug: 'migration-support-instructions',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-site-migration-support-instructions' */ './steps-repository/site-migration-support-instructions'
			),
	},

	UNIFIED_DOMAINS: {
		slug: 'domains',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-unified-domains' */ './steps-repository/unified-domains'
			),
	},

	UNIFIED_PLANS: {
		slug: 'plans',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-unified-plans' */ './steps-repository/unified-plans'
			),
	},

	USE_MY_DOMAIN: {
		slug: 'use-my-domain',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-use-my-domain' */ './steps-repository/use-my-domain'
			),
	},

	PICK_SITE: {
		slug: 'sitePicker',
		asyncComponent: () =>
			import( /* webpackChunkName: 'async-step-site-picker' */ './steps-repository/site-picker' ),
	},

	SEGMENTATION_SURVEY: {
		slug: 'segmentation-survey',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-segmentation-survey' */ './steps-repository/segmentation-survey'
			),
	},
	PLATFORM_IDENTIFICATION: {
		slug: 'platform-identification',
		asyncComponent: () =>
			import(
				/* webpackChunkName: 'async-step-platform-identification' */ './steps-repository/platform-identification'
			),
	},
} satisfies Record< string, StepperStep >;

/**
 * Define steps that are only used by the Stepper framework. Any flow should avoid include these steps as much as possible.
 */
export const PRIVATE_STEPS = {
	USER: {
		slug: 'user',
		asyncComponent: () =>
			import( /* webpackChunkName: "stepper-user-step" */ './steps-repository/__user' ),
	},
} satisfies Record< string, StepperStep >;
