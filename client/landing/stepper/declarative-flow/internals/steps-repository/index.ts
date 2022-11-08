export type StepPath =
	| 'courses'
	| 'intent'
	| 'goals'
	| 'podcastTitle'
	| 'options'
	| 'bloggerStartingPoint'
	| 'storeFeatures'
	| 'designSetup'
	| 'patternAssembler'
	| 'import'
	| 'importList'
	| 'importLight'
	| 'importReady'
	| 'importReadyNot'
	| 'importReadyWpcom'
	| 'importReadyPreview'
	| 'importerWix'
	| 'importerBlogger'
	| 'importerMedium'
	| 'importerSquarespace'
	| 'importerWordpress'
	| 'businessInfo'
	| 'storeAddress'
	| 'patterns'
	| 'processing'
	| 'login'
	| 'vertical'
	| 'wooTransfer'
	| 'wooInstallPlugins'
	| 'error'
	| 'wooConfirm'
	| 'wooVerifyEmail'
	| 'editEmail'
	| 'difmStartingPoint'
	| 'letsGetStarted'
	| 'chooseADomain'
	| 'linkInBioSetup'
	| 'linkInBioPostSetup'
	| 'newsletterSetup'
	| 'newsletterPostSetup'
	| 'intro'
	| 'launchpad'
	| 'subscribers'
	| 'getCurrentThemeSoftwareSets'
	| 'designCarousel'
	| 'storeProfiler';

/**
 * If you add a new step, and this step's folder name is not camelCase, you should map the step name to the correct camelCase name here.
 * If your step's folder name is camelCase (eg intro, or designSetup), you don't have to add it below.
 */

export const stepsNameMap: Partial< Record< StepPath, string > > = {
	courses: 'courses',
	intent: 'intent-step',
	podcastTitle: 'podcast-title',
	options: 'site-options',
	bloggerStartingPoint: 'blogger-starting-point',
	storeFeatures: 'store-features',
	designSetup: 'design-setup',
	patternAssembler: 'pattern-assembler',
	importLight: 'import-light',
	importList: 'import-list',
	importReady: 'import-ready',
	importReadyNot: 'import-ready-not',
	importReadyWpcom: 'import-ready-wpcom',
	importReadyPreview: 'import-ready-preview',
	importerWix: 'importer-wix',
	importerBlogger: 'importer-blogger',
	importerMedium: 'importer-medium',
	importerSquarespace: 'importer-squarespace',
	importerWordpress: 'importer-wordpress',
	businessInfo: 'business-info',
	storeAddress: 'store-address',
	vertical: 'site-vertical',
	wooTransfer: 'woo-transfer',
	wooInstallPlugins: 'woo-install-plugins',
	processing: 'processing-step',
	error: 'error-step',
	wooConfirm: 'woo-confirm',
	wooVerifyEmail: 'woo-verify-email',
	editEmail: 'edit-email',
	newsletterSetup: 'newsletter-setup',
	newsletterPostSetup: 'newsletter-post-setup',
	difmStartingPoint: 'difm-starting-point',
	letsGetStarted: 'lets-get-started',
	linkInBioSetup: 'link-in-bio-setup',
	linkInBioPostSetup: 'link-in-bio-post-setup',
	chooseADomain: 'choose-a-domain',
	getCurrentThemeSoftwareSets: 'get-current-theme-software-sets',
	storeProfiler: 'store-profiler',
	designCarousel: 'design-carousel',
};
