export const FLOW_ID = 'gutenboarding';
export const GUTENBOARDING_LAUNCH_FLOW = 'gutenboarding-launch';
export const FOCUSED_LAUNCH_FLOW = 'focused-launch';
export const SITE_LAUNCH_FLOW = 'launch-site';
export const IMMEDIATE_LAUNCH_QUERY_ARG = 'should_launch';
declare global {
	interface Window {
		wpcomEditorSiteLaunch?: {
			launchUrl: string;
			launchFlow: string;
			// property does not exist when not isGutenboarding
			// property holds the value '1' when isGutenboarding
			isGutenboarding?: '1';
			anchorFmPodcastId: string;
			locale?: string;
		};
		_currentSiteId: number;
		calypsoifyGutenberg?: {
			isFocusedLaunchFlow: boolean;
		};
	}
}
