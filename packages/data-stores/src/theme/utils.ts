/**
 * Given a theme stylesheet string (like 'pub/twentysixteen'), returns the corresponding theme ID ('twentysixteen').
 */
export const getThemeIdFromStylesheet = ( stylesheet: string ) => {
	const [ , slug ] = stylesheet?.split( '/', 2 ) ?? [];
	if ( ! slug ) {
		return stylesheet;
	}
	return slug;
};
