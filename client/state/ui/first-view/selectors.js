export function isViewVisible( state, view ) {
	return -1 !== state.ui.firstView.visible.indexOf( view );
}

export function isViewDismissed( state, view ) {
	return -1 !== state.ui.firstView.dismissed.indexOf( view );
}
