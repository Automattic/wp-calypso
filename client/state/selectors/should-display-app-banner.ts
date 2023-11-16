import { createSelector } from '@automattic/state-utils';
import { isMobile } from '@automattic/viewport';
import { includes } from 'lodash';
import {
	APP_BANNER_DISMISS_TIMES_PREFERENCE,
	ALLOWED_SECTIONS,
	GUTENBERG,
	HOME,
	isDismissed,
	getCurrentSection,
} from 'calypso/blocks/app-banner/utils';
import { isE2ETest } from 'calypso/lib/e2e';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { shouldDisplayTosUpdateBanner } from 'calypso/state/selectors/should-display-tos-update-banner';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSectionName, appBannerIsEnabled, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';

/**
 * Returns true if the App Banner should be displayed
 * @param {Object} state Global state tree
 * @returns {boolean} True if App Banner is visible
 */
export const shouldDisplayAppBanner = ( state: AppState ): boolean | undefined => {
	if ( isE2ETest() ) {
		return false;
	}

	// The ToS update banner is displayed in the same position as the mobile app banner. Since the ToS update
	// has higher priority, we repress all other non-essential sticky banners if the ToS update banner needs to
	// be displayed.
	if ( shouldDisplayTosUpdateBanner( state ) ) {
		return false;
	}

	// In some cases such as error we want to hide the app banner completely.
	if ( ! appBannerIsEnabled( state ) ) {
		return false;
	}

	if ( ! hasReceivedRemotePreferences( state ) ) {
		return false;
	}

	const sectionName = getSectionName( state );
	const isNotesOpen = isNotificationsOpen( state );
	const currentSection = getCurrentSection( sectionName, isNotesOpen );

	// Never show the AppBanner in the site setup flow in the gutenberg section
	if ( getCurrentFlowName( state ) === 'setup-site' && GUTENBERG === currentSection ) {
		return false;
	}

	// Do not show the banner if the user will be redirected to launchpad
	const currentSiteId = getSelectedSiteId( state );
	const launchpadScreen = getSiteOption( state, currentSiteId, 'launchpad_screen' );
	if ( launchpadScreen === 'full' && HOME === currentSection ) {
		return false;
	}

	if ( ! includes( ALLOWED_SECTIONS, currentSection ) ) {
		return false;
	}

	const dismissedUntil = getPreference( state, APP_BANNER_DISMISS_TIMES_PREFERENCE );
	const dismissed = isDismissed( dismissedUntil, currentSection );

	return isMobile() && ! isWpMobileApp() && ! dismissed;
};

export default createSelector( shouldDisplayAppBanner, [
	shouldDisplayTosUpdateBanner,
	appBannerIsEnabled,
	getSelectedSiteId,
	hasReceivedRemotePreferences,
	getSectionName,
	isNotificationsOpen,
	( state: AppState ) => getPreference( state, APP_BANNER_DISMISS_TIMES_PREFERENCE ),
] );
