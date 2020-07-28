const os = require( 'os' );
const path = require( 'path' );
const fs = require( 'fs' ).promises;

const getShellRc = () => {
	if ( process.env.SHELL.match( /zsh/ ) ) {
		return path.join( process.env.HOME, '.zshrc' );
	}
	return path.join( process.env.HOME, '.bashrc' );
};

const getNpmRc = () => path.join( process.env.HOME, '.npmrc' );

const getMemInMb = () => os.totalmem() / 1024 / 1024;

const getDockerConfig = async () => {
	try {
		const content = await fs.readFile(
			path.join( process.env.HOME, 'Library/Group Containers/group.com.docker/settings.json' ),
			'utf8'
		);
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
};
