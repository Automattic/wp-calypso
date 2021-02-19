/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';

/**
 * Returns a selector that tests if a feature is enabled in config
 *
 * @param {string} feature Name of feature
 * @returns {Function} Selector function
 */
export const isEnabled = ( feature ) => () => config.isEnabled( feature );
