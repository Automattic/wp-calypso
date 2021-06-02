export default () => ( req, res, next ) => {
	// let target;
	// const isDevelopment = process.env.NODE_ENV === 'development';

	// if ( isDevelopment ) {
	// 	target = process.env.DEV_TARGET || 'evergreen';
	// } else if ( req.query.forceFallback ) {
	// 	// Did the user force fallback, via query parameter?
	// 	target = 'fallback';
	// } else {
	// 	target = isUAInBrowserslist( req.useragent.source, 'evergreen' ) ? 'evergreen' : 'fallback';
	// }

	// target = 'evergreen';
	req.getTarget = () => 'evergreen';
	req.bypassTargetRedirection = () => false;

	// req.getTarget = () => ( target === 'fallback' ? null : target );
	// req.bypassTargetRedirection = () => req.query.bypassTargetRedirection === 'true';

	next();
};
