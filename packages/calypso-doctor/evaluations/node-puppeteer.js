const { getShellRc } = require( '../lib' );

module.exports = {
	title: 'Puppeteer skip download',
	group: 'Node.js',
	description: 'Do not download puppeteer',
	test: () => {
		if ( ! process.env.PUPPETEER_SKIP_DOWNLOAD ) {
			return { result: false, message: 'PUPPETEER_SKIP_DOWNLOAD is not set' };
		}

		return { result: true };
	},
	fix: () => {
		const shell = getShellRc();
		return `Add \`PUPPETEER_SKIP_DOWNLOAD=true\` to ${ shell }`;
	},
};
