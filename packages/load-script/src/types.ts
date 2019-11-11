/**
 * Callbacks that will be invoked on script load or error.
 *
 * Callbacks will be passed `null` on success or `Error` otherwise.
 */
export type ScriptCallback = ( error: null | Error ) => void;
