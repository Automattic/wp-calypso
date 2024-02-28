export const STEPS = {
	BLOGGER_STARTING_POINT: {
		slug: 'bloggerStartingPoint',
		asyncComponent: () => import( './steps-repository/blogger-starting-point' ),
	},

	BUSINESS_INFO: {
		slug: 'businessInfo',
		asyncComponent: () => import( './steps-repository/business-info' ),
	},

	CELEBRATION: {
		slug: 'celebration-step',
		asyncComponent: () => import( './steps-repository/celebration-step' ),
	},

	CHECK_SITES: {
		slug: 'check-sites',
		asyncComponent: () => import( './steps-repository/sites-checker' ),
	},

	COURSES: { slug: 'courses', asyncComponent: () => import( './steps-repository/courses' ) },

	DESIGN_CHOICES: {
		slug: 'design-choices',
		asyncComponent: () => import( './steps-repository/design-choices' ),
	},

	DESIGN_SETUP: {
		slug: 'designSetup',
		asyncComponent: () => import( './steps-repository/design-setup' ),
	},

	DIFM_STARTING_POINT: {
		slug: 'difmStartingPoint',
		asyncComponent: () => import( './steps-repository/difm-starting-point' ),
	},

	DOMAINS: {
		slug: 'domains',
		asyncComponent: () => import( './steps-repository/domains' ),
	},

	ERROR: { slug: 'error', asyncComponent: () => import( './steps-repository/error-step' ) },

	FREE_POST_SETUP: {
		slug: 'freePostSetup',
		asyncComponent: () => import( './steps-repository/free-post-setup' ),
	},

	FREE_SETUP: {
		slug: 'freeSetup',
		asyncComponent: () => import( './steps-repository/free-setup' ),
	},

	GOALS: { slug: 'goals', asyncComponent: () => import( './steps-repository/goals' ) },

	IMPORT: { slug: 'import', asyncComponent: () => import( './steps-repository/import' ) },

	IMPORT_LIGHT: {
		slug: 'importLight',
		asyncComponent: () => import( './steps-repository/import-light' ),
	},

	IMPORT_LIST: {
		slug: 'importList',
		asyncComponent: () => import( './steps-repository/import-list' ),
	},

	IMPORT_READY: {
		slug: 'importReady',
		asyncComponent: () => import( './steps-repository/import-ready' ),
	},

	IMPORT_READY_NOT: {
		slug: 'importReadyNot',
		asyncComponent: () => import( './steps-repository/import-ready-not' ),
	},

	IMPORT_READY_PREVIEW: {
		slug: 'importReadyPreview',
		asyncComponent: () => import( './steps-repository/import-ready-preview' ),
	},

	IMPORT_READY_WPCOM: {
		slug: 'importReadyWpcom',
		asyncComponent: () => import( './steps-repository/import-ready-wpcom' ),
	},

	IMPORTER_BLOGGER: {
		slug: 'importerBlogger',
		asyncComponent: () => import( './steps-repository/importer-blogger' ),
	},

	IMPORTER_MEDIUM: {
		slug: 'importerMedium',
		asyncComponent: () => import( './steps-repository/importer-medium' ),
	},

	IMPORTER_SQUARESPACE: {
		slug: 'importerSquarespace',
		asyncComponent: () => import( './steps-repository/importer-squarespace' ),
	},

	IMPORTER_WIX: {
		slug: 'importerWix',
		asyncComponent: () => import( './steps-repository/importer-wix' ),
	},

	IMPORTER_WORDPRESS: {
		slug: 'importerWordpress',
		asyncComponent: () => import( './steps-repository/importer-wordpress' ),
	},

	INTENT: {
		slug: 'intent',
		asyncComponent: () => import( './steps-repository/intent-step' ),
	},

	NEW_OR_EXISTING_SITE: {
		slug: 'new-or-existing-site',
		asyncComponent: () => import( './steps-repository/new-or-existing-site' ),
	},

	LAUNCHPAD: { slug: 'launchpad', asyncComponent: () => import( './steps-repository/launchpad' ) },

	OPTIONS: {
		slug: 'options',
		asyncComponent: () => import( './steps-repository/site-options' ),
	},

	PATTERN_ASSEMBLER: {
		slug: 'pattern-assembler',
		asyncComponent: () => import( './steps-repository/pattern-assembler' ),
	},

	PLANS: { slug: 'plans', asyncComponent: () => import( './steps-repository/plans' ) },

	PROCESSING: {
		slug: 'processing',
		asyncComponent: () => import( './steps-repository/processing-step' ),
	},

	SITE_CREATION_STEP: {
		slug: 'create-site',
		asyncComponent: () => import( './steps-repository/create-site' ),
	},

	SITE_LAUNCH: {
		slug: 'site-launch',
		asyncComponent: () => import( './steps-repository/site-launch' ),
	},

	SITE_PICKER: {
		slug: 'site-picker',
		asyncComponent: () => import( './steps-repository/site-picker-list' ),
	},

	SITE_PROMPT: {
		slug: 'site-prompt',
		asyncComponent: () => import( './steps-repository/ai-site-prompt' ),
	},

	STORE_ADDRESS: {
		slug: 'storeAddress',
		asyncComponent: () => import( './steps-repository/store-address' ),
	},

	TRIAL_ACKNOWLEDGE: {
		slug: 'trialAcknowledge',
		asyncComponent: () => import( './steps-repository/trial-acknowledge' ),
	},

	VERIFY_EMAIL: {
		slug: 'verifyEmail',
		asyncComponent: () => import( './steps-repository/import-verify-email' ),
	},

	BUNDLE_CONFIRM: {
		slug: 'bundleConfirm',
		asyncComponent: () => import( './steps-repository/bundle-confirm' ),
	},

	BUNDLE_INSTALL_PLUGINS: {
		slug: 'bundleInstallPlugins',
		asyncComponent: () => import( './steps-repository/bundle-install-plugins' ),
	},

	BUNDLE_TRANSFER: {
		slug: 'bundleTransfer',
		asyncComponent: () => import( './steps-repository/bundle-transfer' ),
	},

	WAIT_FOR_ATOMIC: {
		slug: 'waitForAtomic',
		asyncComponent: () => import( './steps-repository/wait-for-atomic' ),
	},

	WAIT_FOR_PLUGIN_INSTALL: {
		slug: 'waitForPluginInstall',
		asyncComponent: () => import( './steps-repository/wait-for-plugin-install' ),
	},

	ASSIGN_TRIAL_PLAN: {
		slug: 'assignTrialPlan',
		asyncComponent: () => import( './steps-repository/assign-trial-plan' ),
	},

	SITE_MIGRATION_INSTRUCTIONS: {
		slug: 'site-migration-instructions',
		asyncComponent: () => import( './steps-repository/site-migration-instructions' ),
	},

	SITE_MIGRATION_IMPORT_OR_MIGRATE: {
		slug: 'site-migration-import-or-migrate',
		asyncComponent: () => import( './steps-repository/site-migration-import-or-migrate' ),
	},

	SITE_MIGRATION_UPGRADE_PLAN: {
		slug: 'site-migration-upgrade-plan',
		asyncComponent: () => import( './steps-repository/site-migration-upgrade-plan' ),
	},
};
