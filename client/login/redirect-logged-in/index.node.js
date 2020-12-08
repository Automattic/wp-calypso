export default function redirectLoggedIn( { isLoggedIn, res }, next ) {
	if ( isLoggedIn ) {
		res.redirect( '/' );
		return;
	}

	next();
}
