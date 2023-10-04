import 'calypso/state/automated-transfer/init';

/**
 * Re-exports
 */
export { getSiteSync } from 'calypso/state/sync/selectors/get-site-sync';
export { getSyncStatus } from 'calypso/state/sync/selectors/get-sync-status';
export { getSyncProgress } from 'calypso/state/sync/selectors/get-sync-progress';
export { getIsSyncingInProgress } from 'calypso/state/sync/selectors/get-is-syncing-in-progress';
export { default as isFetchingSyncStatus } from 'calypso/state/sync/selectors/is-fetching-site-sync-status';
