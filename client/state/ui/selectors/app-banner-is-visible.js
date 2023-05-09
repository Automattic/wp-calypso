import 'calypso/state/ui/init';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';

export default function isAppBannerEnabled( state ) {
	// since on mobile the sidebar layout focus take up the whole "Page" we never want to show the App Banner
	// when the side bar in in focus.
	return state.ui.appBannerVisibility && getCurrentLayoutFocus( state ) !== 'sidebar';
}
