import { APP_BANNER_DISMISSED } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

/**
 * Dismiss the AppBanner.
 *
 * @returns {object} Action object
 */
export const dismissAppBanner = () => ( { type: APP_BANNER_DISMISSED } );
