/**
 * Escapes the RegExp special characters in a string so it can be safely embedded
 * as a literal inside a regular expression, matching lodash's `escapeRegExp` for
 * string input.
 *
 * Intentionally typed for strings only: it does not replicate lodash's coercion
 * of arbitrary values to strings.
 * @param value The string to escape.
 * @returns The string with RegExp special characters escaped.
 */
const escapeRegExp = ( value: string ): string => value.replace( /[\\^$.*+?()[\]{}|]/g, '\\$&' );

export default escapeRegExp;
