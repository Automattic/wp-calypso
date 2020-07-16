/*
 * Look at the request headers and determine if the request is logged in or logged out or if
 * it's a support session. Set `req.context.isLoggedIn` and `req.context.isSupportSession` flags
 * accordingly. The handler is called very early (immediately after parsing the cookies) and
 * all following handlers (including the locale and redirect ones) can rely on the context values.
 */
export default () => ( req, res, next ) => {
	const isSupportSession = !! req.get( 'x-support-session' ) || !! req.cookies.support_session_id;
	const isLoggedIn = !! req.cookies.wordpress_logged_in;

	req.context = {
		...req.context,
		isSupportSession,
		isLoggedIn,
	};

	next();
};
