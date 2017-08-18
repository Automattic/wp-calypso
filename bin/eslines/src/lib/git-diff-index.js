const childProcess = require( 'child_process' );
const path = require( 'path' );

module.exports = function() {
	const argsRootPath = [ 'rev-parse', '--show-toplevel' ];
	const rootPath = childProcess.spawnSync( 'git', argsRootPath ).stdout.toString().trim();

	const srcPrefix = '--src-prefix=' + path.join( rootPath, '/' );
	const dstPrefix = '--dst-prefix=' + path.join( rootPath, '/' );
	const argsDiff = [ 'diff', '--cached', srcPrefix, dstPrefix, '-U0' ];
	const diff = childProcess.spawnSync( 'git', argsDiff ).stdout.toString().trim();

	return diff;
};
