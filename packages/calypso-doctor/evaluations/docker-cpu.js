const { getDockerConfig } = require( '../lib' );

module.exports = {
	title: 'CPUs allocated',
	group: 'Docker',
	description: 'Ensures Docker has enough CPUs allocated',
	test: () => {
		const { cpus } = getDockerConfig();
		if ( cpus < 4 ) {
			return { result: false, message: 'Docker needs at least 4 CPUs' };
		}
		return { result: true };
	},
	fix: () => {
		return `Edit Docker configuration and assign 4 CPUs`;
	},
};
