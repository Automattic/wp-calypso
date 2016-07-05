import { FIRST_VIEW_START_DATES } from './constants';

export function doesViewHaveFirstView( view ) {
	return !! ( FIRST_VIEW_START_DATES[ view ] );
}

export function isViewVisible( state, view ) {
	return (
		doesViewHaveFirstView( view ) &&
		isViewEnabled( state, view ) &&
		-1 !== state.firstView.visible.indexOf( view )
	);
}

export function isViewEnabled( state, view ) {
	return doesViewHaveFirstView( view ) && -1 === state.firstView.disabled.indexOf( view );
}

export function getDisabledViews( state ) {
	return state.firstView.disabled;
}
