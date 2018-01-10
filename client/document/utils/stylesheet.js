/** @format */

function addIf( cond, str ) {
	return cond ? str : '';
}

function getStylesheetUrl( { isRtl, env, isDebug } ) {
	const isDevOrDebug = env === 'development' || isDebug;
	// style[-debug][-rtl].css
	const stylesheet = 'style' + addIf( isDevOrDebug, '-debug' ) + addIf( isRtl, '-rtl' ) + '.css';

	return stylesheet;
}

export default getStylesheetUrl;
