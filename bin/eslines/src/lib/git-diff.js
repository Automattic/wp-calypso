const childProcess = require( 'child_process' );
const path = require( 'path' );

module.exports = function( remote ) {
	const argsBranchName = [ 'rev-parse', '--abbrev-ref', 'HEAD' ];
	const branchName = childProcess.spawnSync( 'git', argsBranchName ).stdout.toString().trim();

	const argsBase = [ 'merge-base', branchName, remote ];
	const base = childProcess.spawnSync( 'git', argsBase ).stdout.toString().trim();

	const argsRootPath = [ 'rev-parse', '--show-toplevel' ];
	const rootPath = childProcess.spawnSync( 'git', argsRootPath ).stdout.toString().trim();

	const srcPrefix = '--src-prefix=' + path.join( rootPath, '/' );
	const dstPrefix = '--dst-prefix=' + path.join( rootPath, '/' );
	const argsDiff = [ 'diff', srcPrefix, dstPrefix, '-U0', base + '..HEAD' ];
	const diff = childProcess.spawnSync( 'git', argsDiff ).stdout.toString().trim();

	return diff;
};
