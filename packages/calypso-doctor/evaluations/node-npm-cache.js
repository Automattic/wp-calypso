const { promisify } = require( 'util' );
const exec = promisify( require( 'child_process' ).exec );

const { getNpmRc } = require( '../lib' );

module.exports = {
	title: 'npm cache',
	group: 'Node.js',
	description: 'Sets npm_config_cache, used by many packages to store downloaded binaries.',
	test: async ( { pass, fail, ignore } ) => {
		if ( process.platform !== 'darwin' && process.platform !== 'linux' ) {
			ignore( 'This evaluation only works in OSX or Linux' );
			return;
		}

		const yarnPath = process.env.npm_config_yarn_path || 'yarn';
		const { stdout } = await exec( `${ yarnPath } run -s env` );
		const env = JSON.parse( stdout );

		if ( ! env.npm_config_cache ) {
			fail( 'npm_config_cache is not set' );
			return;
		}

		pass();
	},
	fix: async () => {
		const yarnPath = process.env.npm_config_yarn_path || 'yarn';
		const { stdout } = await exec( `${ yarnPath } cache dir` );
		const yarnCachePath = stdout.trim();

		return `Add \`cache=${ yarnCachePath }\` to ${ getNpmRc() }`;
	},
};
