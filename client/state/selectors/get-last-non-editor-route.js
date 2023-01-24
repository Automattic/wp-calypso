/**
 * Get the last non-editor route while ignoring navigation in block editor.
 *
 * @param {Object} state  Global state tree
 * @returns {string} The last non editor route -- empty string if none.
 */
const getLastNonEditorRoute = ( state ) => state?.route?.lastNonEditorRoute || '';

export default getLastNonEditorRoute;
