import 'calypso/state/ui/init';

export default function isAppBannerEnabled( state ) {
	// since on mobile the sidebar layout focus take up the whole "Page" we never want to show the App Banner
	// when the side bar in in focus.
	return state.ui.appBannerVisibility && state.ui.layoutFocus.current !== 'sidebar';
}
