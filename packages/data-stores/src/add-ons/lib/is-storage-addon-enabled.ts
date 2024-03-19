import config from '@automattic/calypso-config';

/**
 * Is the storage addon (space upgrade) available, based on config flag vs. environment.
 * @returns {boolean} - Whether or not the storage addon is available
 */
const isStorageAddonEnabled = (): boolean => !! config.isEnabled( 'storage-addon' );

export default isStorageAddonEnabled;
