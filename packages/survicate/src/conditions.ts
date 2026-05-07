import debug from './debug';

export const SURVICATE_WORKSPACE_ID = 'e4794374cce15378101b63de24117572';

/**
 * Checks whether Survicate should be loaded based on locale and device type.
 * Survicate is only loaded for English locales on non-mobile devices.
 */
export function shouldLoadSurvicate( {
	locale,
	isMobile,
}: {
	locale: string;
	isMobile: boolean;
} ): boolean {
	if ( ! locale.startsWith( 'en' ) ) {
		debug( 'shouldLoadSurvicate: skipping, non-English locale "%s"', locale );
		return false;
	}

	if ( isMobile ) {
		debug( 'shouldLoadSurvicate: skipping, mobile device' );
		return false;
	}

	return true;
}
