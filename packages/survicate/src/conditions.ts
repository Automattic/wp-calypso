export const SURVICATE_WORKSPACE_ID = 'e4794374cce15378101b63de24117572';

/**
 * Checks whether Survicate should be loaded based on locale and device type.
 * Survicate is only loaded for English locales on non-mobile devices.
 */
export function shouldLoadSurvicate( options: { locale: string; isMobile: boolean } ): boolean {
	if ( ! options.locale.startsWith( 'en' ) ) {
		return false;
	}

	if ( options.isMobile ) {
		return false;
	}

	return true;
}
