/**
 * Internal dependencies
 */
// Register the hook that customize the core video block
import './editor';

// This is exporting deliberately an empty object so we don't break `getExtensions`
// at the same time we don't register any new plugin or block
export const settings = {};
