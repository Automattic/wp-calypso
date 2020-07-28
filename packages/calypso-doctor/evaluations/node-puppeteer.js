const { getShellRc } = require( '../lib' );

module.exports = {
	title: 'Skip Puppeteer download',
	group: 'Node.js',
	description: 'Do not download puppeteer',
	test: ( { pass, fail, ignore } ) => {
		if ( process.platform !== 'darwin' && process.platform !== 'linux' ) {
			ignore( 'This evaluation only works in OSX or Linux' );
			return;
		}

		if ( ! process.env.PUPPETEER_SKIP_DOWNLOAD ) {
			fail( 'PUPPETEER_SKIP_DOWNLOAD is not set' );
			return;
		}

		pass();
	},
	fix: () => {
		const shell = getShellRc();
		return `Add \`PUPPETEER_SKIP_DOWNLOAD=true\` to ${ shell }`;
	},
};
