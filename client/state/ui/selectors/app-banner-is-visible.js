import 'calypso/state/ui/init';
import { getPreviousFlowName } from 'calypso/state/signup/flow/selectors';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';

export default function isAppBannerEnabled( state ) {
	// Never show the AppBanner if the previous flow is set to onboarding.
	if ( getPreviousFlowName( state ) === 'onboarding' ) {
		return false;
	}
	// since on mobile the sidebar layout focus take up the whole "Page" we never want to show the App Banner
	// when the side bar in in focus.
	return state.ui.appBannerVisibility && getCurrentLayoutFocus( state ) !== 'sidebar';
}
