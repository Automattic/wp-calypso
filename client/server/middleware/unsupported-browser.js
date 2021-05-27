export default () => ( req, res, next ) => {
	if (
		// The redirection is not disabled
		req.bypassTargetRedirection() === false &&
		// ... and this is fallback target
		req.getTarget() === null &&
		// ... and we are not already in /browsehappy
		req.path !== '/browsehappy'
	) {
		return res.redirect( '/browsehappy' );
	}
	next();
};
