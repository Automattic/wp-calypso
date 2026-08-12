import cookie from 'cookie';
import { isCountryInGdprZone, isRegionInCcpaZone } from './geo-privacy';
import getTrackingPrefs, { type TrackingPrefs } from './get-tracking-prefs';

export type GoogleConsentModeValue = 'granted' | 'denied';

export type GoogleConsentModeSignals = {
	ad_storage: GoogleConsentModeValue;
	analytics_storage: GoogleConsentModeValue;
	ad_user_data: GoogleConsentModeValue;
	ad_personalization: GoogleConsentModeValue;
};

type NavigatorWithGlobalPrivacyControl = Navigator & {
	globalPrivacyControl?: boolean;
};

type GeoCookies = {
	country_code?: string;
	region?: string;
};

export const DEFAULT_GOOGLE_CONSENT_MODE_SIGNALS: GoogleConsentModeSignals = {
	ad_storage: 'denied',
	analytics_storage: 'denied',
	ad_user_data: 'denied',
	ad_personalization: 'denied',
};

const toConsentValue = ( isGranted: boolean ): GoogleConsentModeValue =>
	isGranted ? 'granted' : 'denied';

const getGeoCookies = (): GeoCookies => {
	if ( typeof document === 'undefined' ) {
		return {};
	}

	return cookie.parse( document.cookie );
};

const isGpcFlagSetOptOut = (): boolean => {
	if ( typeof navigator === 'undefined' ) {
		return false;
	}

	return ( navigator as NavigatorWithGlobalPrivacyControl ).globalPrivacyControl === true;
};

const mayGrantAdvertisingConsent = (
	hasAdvertisingConsent: boolean,
	{ country_code, region }: GeoCookies
): boolean => {
	if ( ! hasAdvertisingConsent ) {
		return false;
	}

	if ( isRegionInCcpaZone( country_code, region ) && isGpcFlagSetOptOut() ) {
		return false;
	}

	return true;
};

const isGdprPreConsent = ( prefs: TrackingPrefs, { country_code }: GeoCookies ): boolean => {
	return isCountryInGdprZone( country_code ) && prefs.ok !== true;
};

export function getGoogleConsentModeSignals(
	trackingPrefs?: TrackingPrefs
): GoogleConsentModeSignals {
	try {
		if ( ! trackingPrefs && typeof document === 'undefined' ) {
			return { ...DEFAULT_GOOGLE_CONSENT_MODE_SIGNALS };
		}

		const prefs = trackingPrefs ?? getTrackingPrefs();
		const geoCookies = getGeoCookies();
		if ( isGdprPreConsent( prefs, geoCookies ) ) {
			return { ...DEFAULT_GOOGLE_CONSENT_MODE_SIGNALS };
		}

		const advertisingConsent = mayGrantAdvertisingConsent(
			Boolean( prefs.buckets.advertising ),
			geoCookies
		);

		return {
			analytics_storage: toConsentValue( Boolean( prefs.buckets.analytics ) ),
			ad_storage: toConsentValue( advertisingConsent ),
			ad_user_data: toConsentValue( advertisingConsent ),
			ad_personalization: toConsentValue( advertisingConsent ),
		};
	} catch {
		return { ...DEFAULT_GOOGLE_CONSENT_MODE_SIGNALS };
	}
}
