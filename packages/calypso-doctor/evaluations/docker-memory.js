const { getDockerConfig } = require( '../lib' );

module.exports = {
	title: 'Memory allocated',
	group: 'Docker',
	description: 'Ensures Docker has enough memory allocated',
	test: () => {
		const { memoryMiB } = getDockerConfig();
		if ( memoryMiB < 8192 ) {
			return { result: false, message: 'Docker needs at least 8gb' };
		}
		return { result: true };
	},
	fix: () => {
		return `Edit Docker configuration and assign 8gb of memory`;
	},
};
