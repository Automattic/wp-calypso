export function isViewVisible( state, view ) {
	return ( ! isViewDisabled( state, view ) ) && -1 !== state.firstView.visible.indexOf( view );
}

export function isViewDisabled( state, view ) {
	return -1 !== state.firstView.disabled.indexOf( view );
}

export function getDisabledViews( state ) {
	return state.firstView.disabled;
}
