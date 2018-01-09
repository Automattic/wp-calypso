/** @format */

function addIf( cond, str ) {
	return cond ? str : '';
}

function getStylesheetUrl( { urls, isRtl, env, isDebug } ) {
	const isDevOrDebug = env === 'development' || isDebug;
	// style[-debug][-rtl].css
	const stylesheet = 'style' + addIf( isDevOrDebug, '-debug' ) + addIf( isRtl, '-rtl' ) + '.css';

	return urls[ stylesheet ];
}

export default getStylesheetUrl;
