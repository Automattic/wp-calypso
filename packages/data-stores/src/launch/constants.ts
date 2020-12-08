export const STORE_KEY = 'automattic/launch';
export const SITE_STORE = 'automattic/site';
export const PLANS_STORE = 'automattic/onboard/plans';

declare global {
	interface Window {
		_currentSiteId: number;
	}
}
export const SITE_ID = window._currentSiteId;
