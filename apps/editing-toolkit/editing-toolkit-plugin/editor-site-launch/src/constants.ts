export const FLOW_ID = 'gutenboarding';
export const STEP_BY_STEP_LAUNCH_FLOW = 'step-by-step';
export const FOCUSED_LAUNCH_FLOW = 'focused';
export const REDIRECT_LAUNCH_FLOW = 'redirect';
declare global {
	interface Window {
		wpcomEditorSiteLaunch?: {
			launchUrl: string;
			launchFlow: string;
			locale?: string;
		};
		_currentSiteId: number;
	}
}
