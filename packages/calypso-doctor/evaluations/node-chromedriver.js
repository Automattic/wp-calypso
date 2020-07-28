const { getShellRc } = require( '../lib' );

module.exports = {
	title: 'Skip chromedriver download',
	group: 'Node.js',
	description: 'Do not download chromedriver',
	test: ( { pass, fail, ignore } ) => {
		if ( process.platform !== 'darwin' && process.platform !== 'linux' ) {
			ignore( 'This evaluation only works in OSX or Linux' );
			return;
		}

		if ( ! process.env.CHROMEDRIVER_SKIP_DOWNLOAD ) {
			fail( 'CHROMEDRIVER_SKIP_DOWNLOAD is not set' );
			return;
		}

		pass();
	},
	fix: () => {
		const shell = getShellRc();
		return `Add \`CHROMEDRIVER_SKIP_DOWNLOAD=true\` to ${ shell }`;
	},
};
