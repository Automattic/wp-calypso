/*
 * The export is eligible for inlining, but the module is not used directly but re-exported from `./export.js`.
 * Re-exporting is not supported, therefore no inlining should happen.
 */
export const FOO = 'bar';
