import {
	DEFAULT_GOOGLE_CONSENT_MODE_SIGNALS,
	getGoogleConsentModeSignals,
} from '@automattic/calypso-analytics';

type GoogleTagFunction = ( command: string, ...args: unknown[] ) => void;

type GoogleTagWindow = typeof window & {
	dataLayer?: unknown[];
	gtag?: GoogleTagFunction;
	__calypsoGoogleConsentModeDefaultSet?: boolean;
	__calypsoGoogleTagInitialized?: boolean;
};

export { DEFAULT_GOOGLE_CONSENT_MODE_SIGNALS, getGoogleConsentModeSignals };

const getGoogleTagWindow = (): GoogleTagWindow | null => {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	return window as GoogleTagWindow;
};

const setupGoogleTagGlobal = (): GoogleTagWindow | null => {
	const googleWindow = getGoogleTagWindow();

	if ( ! googleWindow ) {
		return null;
	}

	googleWindow.dataLayer = googleWindow.dataLayer || [];

	if ( ! googleWindow.gtag ) {
		googleWindow.gtag = function ( ...args: unknown[] ) {
			googleWindow.dataLayer?.push( args );
		};
	}

	return googleWindow;
};

export function ensureGoogleConsentModeDefault(): void {
	const googleWindow = setupGoogleTagGlobal();

	if ( ! googleWindow || googleWindow.__calypsoGoogleConsentModeDefaultSet ) {
		return;
	}

	googleWindow.gtag?.( 'consent', 'default', DEFAULT_GOOGLE_CONSENT_MODE_SIGNALS );
	googleWindow.__calypsoGoogleConsentModeDefaultSet = true;
}

export function updateGoogleConsentMode( {
	onlyIfInitialized = false,
}: { onlyIfInitialized?: boolean } = {} ): void {
	const googleWindow = getGoogleTagWindow();

	if ( onlyIfInitialized && ! googleWindow?.gtag ) {
		return;
	}

	ensureGoogleConsentModeDefault();
	setupGoogleTagGlobal()?.gtag?.( 'consent', 'update', getGoogleConsentModeSignals() );
}

export function initializeGoogleTag(): void {
	const googleWindow = setupGoogleTagGlobal();

	if ( ! googleWindow ) {
		return;
	}

	ensureGoogleConsentModeDefault();
	updateGoogleConsentMode();

	if ( googleWindow.__calypsoGoogleTagInitialized ) {
		return;
	}

	googleWindow.gtag?.( 'js', new Date() );
	googleWindow.__calypsoGoogleTagInitialized = true;
}
