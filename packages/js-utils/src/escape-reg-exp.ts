/**
 * Escapes the RegExp special characters in a string so it can be safely embedded
 * as a literal inside a regular expression.
 *
 * Intentionally typed for strings only: it does not coerce non-string values.
 * @param value The string to escape.
 * @returns The string with RegExp special characters escaped.
 */
const escapeRegExp = ( value: string ): string => value.replace( /[\\^$.*+?()[\]{}|]/g, '\\$&' );

export default escapeRegExp;
