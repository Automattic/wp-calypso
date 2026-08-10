/**
 * Utility to get CSS variable values
 * Note: OKLCH colors are automatically converted to RGB by the browser
 * @param variableName
 * @param fallback
 */
export const getCSSVariable = (
	variableName: string,
	fallback: string = ''
): string => {
	try {
		const value = getComputedStyle( document.documentElement )
			.getPropertyValue( variableName )
			.trim();

		return value || fallback;
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.warn( `Failed to get CSS variable ${ variableName }:`, error );
		return fallback;
	}
};
