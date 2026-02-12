import { isEnabled } from '@automattic/calypso-config';

declare global {
	interface Window {
		isGlobalStylesOnPersonal?: boolean;
		globalStylesPersonalVariation?: string;
	}
}
export function isGlobalStylesOnPersonalEnabled(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	if ( window.isGlobalStylesOnPersonal ) {
		return true;
	}

	window.isGlobalStylesOnPersonal = isEnabled( 'global-styles/on-personal-plan' );

	return !! window.isGlobalStylesOnPersonal;
}

export function isGlobalStylesGridChangesVariation(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	return window.globalStylesPersonalVariation === 'treatment2';
}
