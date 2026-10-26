/**
 * The resources the user has marked as read. Each dashboard keeps them in this
 * preference, so a resource read in one shows as read in the other.
 */
export const READ_RESOURCES_PREFERENCE = 'a4a-library-read-resources';

// Shared, so the results don't recompute on every render while preferences load.
export const NO_READ_IDS: number[] = [];
