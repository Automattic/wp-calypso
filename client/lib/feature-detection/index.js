/**
 * Detects if CSS custom properties are supported
 *
 * @returns {boolean} true when feature is supported
 */
export function supportsCssCustomProperties() {
	return (
		typeof window !== 'undefined' &&
		window.CSS &&
		window.CSS.supports &&
		( window.CSS.supports( '--a', 0 ) || window.CSS.supports( 'color', 'var(--a)' ) )
	);
}
