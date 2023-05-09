import type { Design } from '@automattic/design-picker';

const getThemeIdFromDesign = ( design: Design ) => {
	const stylesheet = design?.recipe?.stylesheet;
	if ( stylesheet ) {
		// Transform stylesheet "premium/skivers" into themeId "skivers"
		const slashIndex = stylesheet.lastIndexOf( '/' );
		const themeId = stylesheet.substring( slashIndex + 1 );
		return themeId;
	}
	return null;
};
export default getThemeIdFromDesign;
