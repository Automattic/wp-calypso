export function isViewVisible( state, view ) {
	return -1 !== state.firstView.visible.indexOf( view );
}

export function isViewDismissed( state, view ) {
	return -1 !== state.firstView.dismissed.indexOf( view );
}
