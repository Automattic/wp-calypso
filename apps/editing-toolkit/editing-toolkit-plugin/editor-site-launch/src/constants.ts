export const FLOW_ID = 'gutenboarding';
export const GUTENBOARDING_LAUNCH_FLOW = 'gutenboarding-launch';
export const FOCUSED_LAUNCH_FLOW = 'focused-launch';
export const SITE_LAUNCH_FLOW = 'launch-site';
declare global {
	interface Window {
		wpcomEditorSiteLaunch?: {
			launchUrl: string;
			launchFlow: string;
			isGutenboarding: boolean;
			locale?: string;
		};
		_currentSiteId: number;
		calypsoifyGutenberg?: {
			isFocusedLaunchFlow: boolean;
		};
	}
}
