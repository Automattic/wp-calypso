const { getShellRc } = require( '../lib' );

module.exports = {
	title: 'Skip Playwright download',
	group: 'Node.js',
	description: 'Do not download Playwright',
	test: ( { pass, fail, ignore } ) => {
		if ( process.platform !== 'darwin' && process.platform !== 'linux' ) {
			ignore( 'This evaluation only works in OSX or Linux' );
			return;
		}

		if ( ! process.env.PLAYWRIGHT_SKIP_DOWNLOAD ) {
			fail( 'PLAYWRIGHT_SKIP_DOWNLOAD is not set' );
			return;
		}

		pass();
	},
	fix: () => {
		const shell = getShellRc();
		if ( shell ) {
			return `Add \`export PLAYWRIGHT_SKIP_DOWNLOAD=true\` to ${ shell }`;
		}
		return 'Set env variable `PLAYWRIGHT_SKIP_DOWNLOAD` with value `true`';
	},
};
