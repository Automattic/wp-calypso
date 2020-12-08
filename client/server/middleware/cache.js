export default () => ( req, res, next ) => {
	res.set( 'Cache-control', 'no-store' );
	next();
};
