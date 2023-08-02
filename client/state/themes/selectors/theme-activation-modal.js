import 'calypso/state/themes/init';

export function getThemeIdToActivate( state ) {
	return state.themes.themeActivationModal?.themeId;
}

export function shouldShowActivationModal( state, themeId ) {
	return (
		state.themes.themeActivationModal?.themeId === themeId &&
		state.themes.themeActivationModal?.show
	);
}

export function hasActivationModalAccepted( state, themeId ) {
	return (
		state.themes.themeActivationModal?.themeId === themeId &&
		state.themes.themeActivationModal?.accepted
	);
}
