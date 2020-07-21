const { getShellRc } = require( '../lib' );

module.exports = {
	title: 'Chromedriver skip download',
	group: 'Node.js',
	description: 'Do not download chromedriver',
	test: () => {
		if ( ! process.env.CHROMEDRIVER_SKIP_DOWNLOAD ) {
			return { result: false, message: 'CHROMEDRIVER_SKIP_DOWNLOAD is not set' };
		}

		return { result: true };
	},
	fix: () => {
		const shell = getShellRc();
		return `Add \`CHROMEDRIVER_SKIP_DOWNLOAD=true\` to ${ shell }`;
	},
};
