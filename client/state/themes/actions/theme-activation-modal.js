import {
	THEME_ACTIVATION_MODAL_ACCEPT,
	THEME_ACTIVATION_MODAL_DISMISS,
	THEME_ACTIVATION_MODAL_SHOW,
} from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function showActivationModal( themeId ) {
	return {
		type: THEME_ACTIVATION_MODAL_SHOW,
		themeId,
	};
}

export function acceptActivationModal( themeId ) {
	return {
		type: THEME_ACTIVATION_MODAL_ACCEPT,
		themeId,
	};
}

export function dismissActivationModal( themeId ) {
	return {
		type: THEME_ACTIVATION_MODAL_DISMISS,
		themeId,
	};
}
