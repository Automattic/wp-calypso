export default () => ( req, res, next ) => {
	if ( req.getTarget() === null && req.path !== '/browsehappy' ) {
		return res.redirect( '/browsehappy' );
	}
	next();
};
