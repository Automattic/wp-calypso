export default () => ( req, res, next ) => {
	if ( process.env.NODE_ENV === 'development' ) {
		res.set( 'Cache-control', 'no-store' );
	} else {
		res.set( 'Cache-control', 'public, max-age=300' );
		res.set( 'Vary', 'Cookie' );
	}
	next();
};
