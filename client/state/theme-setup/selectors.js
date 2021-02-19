/**
 * Internal dependencies
 */
import 'calypso/state/theme-setup/init';

export function isThemeSetupDialogVisible( state ) {
	return state.themeSetup.isDialogVisible;
}

export function isThemeSetupActive( state ) {
	return state.themeSetup.active;
}

export function getThemeSetupResult( state ) {
	return state.themeSetup.result;
}
