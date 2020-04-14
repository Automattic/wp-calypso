const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Starting from `startingPath`, traverses it upwards trying to find a file named `package.json`.
 *
 * @param {string} startingPath Path to start from
 * @returns {string|null} The parent path that contains `package.json`, or null if not found
 */
const findClosestPackageJson = function( startingPath ) {
	const parts = startingPath.split( path.sep );
	for ( let i = parts.length; i >= 0; i-- ) {
		const candidatePath = path.join( path.sep, ...parts.slice( 0, i ) );
		if ( fs.existsSync( path.join( candidatePath, 'package.json' ) ) ) {
			return candidatePath;
		}
	}
	return null;
};

/**
 * Finds which lockfile this project is using
 *
 * @returns {string} "yarn" if there is a `yarn.lock`, "npm" if there is a `package-lock.json`, null otherwise
 */
const findLockFile = () => {
	const root = findClosestPackageJson( __dirname );
	if ( fs.existsSync( path.join( root, 'yarn.lock' ) ) ) {
		return 'yarn';
	}
	if ( fs.existsSync( path.join( root, 'package-lock.json' ) ) ) {
		return 'npm';
	}
	return null;
};

/**
 * Finds which package manager was used to run this script
 *
 * @returns {string} 'yarn' or 'npm' based on the user agent, or null if `npm_config_user_agent` is not present or unknonw
 */
const findPackageManager = () => {
	const userAgent = process.env.npm_config_user_agent || '';
	if ( userAgent.startsWith( 'yarn/' ) ) {
		return 'yarn';
	}
	if ( userAgent.startsWith( 'npm/' ) ) {
		return 'npm';
	}
	return null;
};

const lockFile = findLockFile();
const packageManager = findPackageManager();

if ( packageManager === null ) {
	console.warn(
		"WARNING! Can't determine which package manager was used to run this command. Please contact #team-calypso."
	);
} else if ( lockFile === null ) {
	console.warn(
		"WARNING! Can't find a valid lockfile in this project. Please contact #team-calypso."
	);
} else if ( packageManager !== lockFile ) {
	console.error(
		`ERROR! Please use '${ lockFile }' instead of '${ packageManager }' to run commands in this project`
	);
	process.exitCode = 1;
} else {
	process.exitCode = 0;
}
