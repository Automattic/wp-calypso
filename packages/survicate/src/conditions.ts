import debug from './debug';
import { isInSupportSession } from './support-session';

export const SURVICATE_WORKSPACE_ID = 'e4794374cce15378101b63de24117572';

/**
 * Checks whether Survicate should be loaded, based on the support session
 * state, locale and device type. Survicate is only loaded for English locales
 * on non-mobile devices, and never while a Happiness Engineer is in a support
 * session — surveys asked of an HE would both interrupt the session and
 * pollute the results with answers the account holder never gave.
 */
export function shouldLoadSurvicate( {
	locale,
	isMobile,
}: {
	locale: string;
	isMobile: boolean;
} ): boolean {
	if ( isInSupportSession() ) {
		debug( 'shouldLoadSurvicate: skipping, support session' );
		return false;
	}

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
