export default ( req, res, next ) => {
	res.locals.subscriptionManagementSubkey = req.cookies?.subkey || '';
	next();
};
