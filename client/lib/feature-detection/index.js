/** @format */

const featureDetection = {
	/**
	 * Detects if CSS custom properties are supported
	 *
	 * @return {boolean} true when feature is supported
	 */
	supportsCssCustomProperties: () => {
		return (
			window &&
			( window.CSS &&
				window.CSS.supports &&
				( window.CSS.supports( '--a', 0 ) || window.CSS.supports( 'color', 'var(--a)' ) ) )
		);
	},
};

export default featureDetection;
