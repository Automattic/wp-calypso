/**
 * Debounce our input + HTTP dependent select changes
 *
 * Rapidly changing input generates excessive HTTP requests.
 * It also leads to jarring UI changes.
 *
 * @see https://stackoverflow.com/a/44755058/1432801
 */
export const selectorDebounce = 300;

/**
 * Flag for temporarily hiding the sidebar and related toggle button.
 *
 * @todo Remove once we re-enact the sidebar or decide to go without (or via another route).
 */
export const enableSidebarDisplay = false
