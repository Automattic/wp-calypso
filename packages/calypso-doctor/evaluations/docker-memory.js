const { getDockerConfig, isDockerInstalled } = require( '../lib' );

module.exports = {
	title: 'Memory allocated',
	group: 'Docker',
	description: 'Ensures Docker has enough memory allocated',
	test: async ( { pass, fail, ignore } ) => {
		if ( process.platform !== 'darwin' ) {
			ignore( 'This evaluation only works in OSX' );
			return;
		}

		if ( ! ( await isDockerInstalled() ) ) {
			ignore( 'Docker is not installed' );
			return;
		}

		const { memoryMiB } = await getDockerConfig();
		if ( memoryMiB < 8192 ) {
			fail( 'Docker needs at least 8gb' );
			return;
		}

		pass();
	},
	fix: () => {
		return `Edit Docker configuration and assign 8gb of memory`;
	},
};
