const { promises: fs, constants: fsConstants } = require( 'fs' );
const os = require( 'os' );
const path = require( 'path' );

const getShellRc = () => {
	if ( ! process.env.SHELL ) {
		return null;
	}

	if ( process.env.SHELL.match( /zsh/ ) ) {
		return path.join( process.env.HOME, '.zshrc' );
	}
	return path.join( process.env.HOME, '.bashrc' );
};

const getNpmRc = () => path.join( process.env.HOME, '.npmrc' );

const getMemInMb = () => Math.round( os.totalmem() / 1024 / 1024 );

const getDockerSettings = () =>
	path.join( process.env.HOME, 'Library/Group Containers/group.com.docker/settings.json' );

const isDockerInstalled = async () => {
	try {
		await fs.access( getDockerSettings(), fsConstants.R_OK );
		return true;
	} catch {
		return false;
	}
};

const getDockerConfig = async () => {
	try {
		const content = await fs.readFile( getDockerSettings(), 'utf8' );
		return JSON.parse( content );
	} catch ( err ) {
		throw new Error( `Can't load Docker config, ${ err.stack }` );
	}
};

module.exports = {
	getShellRc,
	getNpmRc,
	getMemInMb,
	getDockerConfig,
	isDockerInstalled,
};
