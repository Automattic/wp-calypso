export default () => ( req, res, next ) => {
	if ( process.env.NODE_ENV === 'development' ) {
		res.set( 'Cache-control', 'no-store' );
	} else {
		// private: don't cache in the edge, only in the browser. Nginx doesn't follow Vary by default
		// max-age=300: cache for 5 minutes, so users can get a new version 5 minutes after a release
		// must-revalidate: don't reuse the stale cache, get it form the server again
		res.set( 'Cache-control', 'private, max-age=300, must-revalidate' );

		// If the cookie changes (eg: the user logs in with a different account) do not use the cached response
		res.set( 'Vary', 'Cookie' );
	}
	next();
};
