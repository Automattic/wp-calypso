/**
 * External dependencies
 */
import { DefaultRootState } from 'react-redux';

/**
 * Internal dependencies
 */
import { getPreference } from 'calypso/state/preferences/selectors';
import { Preference } from 'calypso/my-sites/site-settings/jetpack-credentials-banner/types';

import 'calypso/state/site-settings/init';

const MAX_BANNER_VIEWS = 10;
const NINETY_DAYS_IN_MILLISECONDS = 90 * 24 * 60 * 60 * 1000;
export const JETPACK_CREDENTIALS_BANNER_PREFERENCE = 'backup-scan-security-settings-moved';

/**
 * Returns an array of Preferences associated with the banner.
 *
 * @param  {object}  state  Global state tree
 * @returns {Preference[]}  Array of Preference objects
 */
export function getJetpackCredentialsBannerPreference( state: DefaultRootState ): Preference[] {
	let preference = getPreference( state, JETPACK_CREDENTIALS_BANNER_PREFERENCE );

	if ( ! preference || ! Array.isArray( preference ) ) {
		preference = [];
	}

	return preference;
}

/**
 * Returns whether the banner was dismissed by the user.
 *
 * @param  {object}  state  Global state tree
 * @returns {boolean}       Whether the banner was dismissed
 */
function isJetpackCredentialsBannerDismissed( state: DefaultRootState ): boolean {
	const preference = getJetpackCredentialsBannerPreference( state );
	return preference.filter( ( { type } ) => type === 'dismiss' ).length > 0;
}

/**
 * Returns the number of times the Jetpack Credentials Banner was viewed.
 *
 * @param  {object}  state  Global state tree
 * @returns {number}        Number of times the banner was viewed
 */
function getJetpackCredentialsBannerViewCount( state: DefaultRootState ): number {
	const preference = getJetpackCredentialsBannerPreference( state );
	return preference.filter( ( { type } ) => type === 'view' ).length;
}

/**
 * Returns whether the banner was shown to the user, for the first time, more than 90
 * days ago.
 *
 * @param  {object}  state  Global state tree
 * @returns {boolean}       Whether the limit was exceeded
 */
function isJetpackCredentialsBannerTimeLimitExceeded( state: DefaultRootState ): boolean {
	const preference = getJetpackCredentialsBannerPreference( state );
	const firstView = preference.filter( ( { type } ) => type === 'view' )[ 0 ];

	// No view recorded means that the time limit has not been exceeded
	if ( ! firstView ) {
		return false;
	}

	const currentDateInMilli = Date.now();
	const firstViewInMilli = firstView.date;
	if ( firstViewInMilli + NINETY_DAYS_IN_MILLISECONDS >= currentDateInMilli ) {
		return false;
	}

	return true;
}

/**
 * Returns if the banner should be displayed to the user. The results depends on three
 * conditions:
 * 1. The view count is less than 10.
 * 2. The banner has not been dismissed by the user.
 * 3. The first time the user saw the banner was less than 90 days ago.
 *
 * @param  {object}  state  Global state tree
 * @returns {boolean}       Whether the banner should be displayed
 */
export function shouldDisplayJetpackCredentialsBanner( state: DefaultRootState ): boolean {
	const viewCount = getJetpackCredentialsBannerViewCount( state );
	const isBannerDismissed = isJetpackCredentialsBannerDismissed( state );
	const isTimeLimitExceeded = isJetpackCredentialsBannerTimeLimitExceeded( state );

	if ( viewCount >= MAX_BANNER_VIEWS || isBannerDismissed || isTimeLimitExceeded ) {
		return false;
	}
	return true;
}
