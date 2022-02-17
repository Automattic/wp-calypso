import 'calypso/state/ui/init';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';

export default function isAppBannerEnabled( state ) {
	// Never show the AppBanner in the site setup flow.
	if ( getCurrentFlowName( state ) === 'setup-site' ) {
		return false;
	}
	// since on mobile the sidebar layout focus take up the whole "Page" we never want to show the App Banner
	// when the side bar in in focus.
	return state.ui.appBannerVisibility && getCurrentLayoutFocus( state ) !== 'sidebar';
}
