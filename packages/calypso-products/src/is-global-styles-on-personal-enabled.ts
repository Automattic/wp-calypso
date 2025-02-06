import { isEnabled } from '@automattic/calypso-config';

declare global {
	interface Window {
		isGlobalStylesOnPersonal?: boolean;
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
