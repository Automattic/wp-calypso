import { APP_BANNER_TOGGLE_VISIBILITY } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

/**
 * Hide the AppBanner.
 *
 * @returns {object} Action object
 */
export const disableAppBanner = () => ( { type: APP_BANNER_TOGGLE_VISIBILITY, isVisible: false } );

/**
 * Show the AppBanner.
 *
 * @returns {object} Action object
 */
export const enableAppBanner = () => ( { type: APP_BANNER_TOGGLE_VISIBILITY, isVisible: true } );
