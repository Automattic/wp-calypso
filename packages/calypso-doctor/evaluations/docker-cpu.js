const { getDockerConfig, isDockerInstalled } = require( '../lib' );

module.exports = {
	title: 'CPUs allocated',
	group: 'Docker',
	description: 'Ensures Docker has enough CPUs allocated',
	test: async ( { pass, fail, ignore } ) => {
		if ( process.platform !== 'darwin' ) {
			ignore( 'This evaluation only works in OSX' );
			return;
		}

		if ( ! ( await isDockerInstalled() ) ) {
			ignore( 'Docker is not installed' );
		}

		const { cpus } = await getDockerConfig();
		if ( cpus < 4 ) {
			fail( 'Docker needs at least 4 CPUs' );
			return;
		}

		pass();
	},
	fix: () => {
		return `Edit Docker configuration and assign 4 CPUs`;
	},
};
