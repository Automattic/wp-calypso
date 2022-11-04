import * as React from 'react';
import type { StepProps } from '../types';

const stepNameToPathName = {
	courses: 'courses',
	intent: 'intent-step',
	goals: 'goals',
	podcastTitle: 'podcast-title',
	login: 'login',
	options: 'site-options',
	bloggerStartingPoint: 'blogger-starting-point',
	storeFeatures: 'store-features',
	designSetup: 'design-setup',
	patternAssembler: 'pattern-assembler',
	import: 'import',
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
	intro: 'intro',
	linkInBioSetup: 'link-in-bio-setup',
	linkInBioPostSetup: 'link-in-bio-post-setup',
	chooseADomain: 'choose-a-domain',
	launchpad: 'launchpad',
	subscribers: 'subscribers',
	patterns: 'patterns',
	getCurrentThemeSoftwareSets: 'get-current-theme-software-sets',
	storeProfiler: 'store-profiler',
	designCarousel: 'design-carousel',
};

export type StepPath = keyof typeof stepNameToPathName;

interface Props extends StepProps {
	path: StepPath;
}

export const Step = ( { path, ...props }: Props ) => {
	const StepComponent = React.useMemo(
		() =>
			React.lazy(
				() =>
					import(
						/* webpackChunkName: "async-load-stepper-steps-[request]" */
						`./${ stepNameToPathName[ path ] }/index`
					)
			),
		[ path ]
	);

	return <StepComponent { ...props } />;
};
