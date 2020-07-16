/**
 * Internal dependencies
 */
import utils from 'server/bundler/utils';

const SERVER_BASE_PATH = '/public';
const staticFiles = [ { path: 'editor.css' }, { path: 'tinymce/skins/wordpress/wp-content.css' } ];
const staticFilesUrls = staticFiles.reduce( ( result, file ) => {
	if ( ! file.hash ) {
		file.hash = utils.hashFile( process.cwd() + SERVER_BASE_PATH + '/' + file.path );
	}
	result[ file.path ] = utils.getUrl( file.path, file.hash );
	return result;
}, {} );

export default ( req, calypsoEnv ) => {
	const devEnvironments = [ 'development', 'jetpack-cloud-development' ];
	const isDebug = devEnvironments.includes( calypsoEnv ) || req.query.debug !== undefined;

	return {
		app: {
			// use ipv4 address when is ipv4 mapped address
			clientIp: req.ip ? req.ip.replace( '::ffff:', '' ) : req.ip,
			isDebug,
			staticUrls: staticFilesUrls,
		},
	};
};
