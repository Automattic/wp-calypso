export default () => ( req, res, next ) => {
	if (
		req.cookies.bypass_target_redirection === 'true' ||
		req.query.bypassTargetRedirection === 'true'
	) {
		return next();
	}

	const isFallback = req.getTarget() === null;
	if ( isFallback && req.path !== '/browsehappy' ) {
		return res.redirect( '/browsehappy?url=' + encodeURIComponent( req.url ) );
	}

	next();
};
