type PartialReq = {
	originalUrl: string;
};

const STATIC_PATHS = [
	'/calypso/',
	'/service-worker',
	'/nostats.js',
	'/__webpack_hmr',
	'_favicon.ico',
];

/**
 * Returns true if the request is to a static file, like JS bundles.
 * @param req The express request object
 */
export default function isStaticRequest( req: PartialReq ) {
	if ( ! req?.originalUrl ) {
		return false;
	}

	return STATIC_PATHS.some( ( path ) => req.originalUrl.startsWith( path ) );
}
