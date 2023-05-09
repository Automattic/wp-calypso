const { getShellRc, getMemInMb } = require( '../lib' );

module.exports = {
	title: 'Node memory',
	group: 'Node.js',
	description:
		'Sets the maximum size of Node.js heap. As memory consumption approaches this limit, Node.js will spend more time on garbage collection in an effort to free unused memory.',
	test: ( { pass, fail, ignore } ) => {
		if ( process.platform !== 'darwin' && process.platform !== 'linux' ) {
			ignore( 'This evaluation only works in OSX or Linux' );
			return;
		}

		if ( ! process.env.NODE_OPTIONS ) {
			fail( 'NODE_OPTIONS is not set' );
			return;
		}

		const match = process.env.NODE_OPTIONS.match( /--max-old-space-size=([0-9]+)/ );
		if ( ! match ) {
			fail( 'max-old-space-size not set' );
			return;
		}

		const currentValue = Number( match[ 1 ] );
		const desiredValue = getMemInMb() * 0.75;
		if ( currentValue < desiredValue ) {
			fail( `Memory set to ${ currentValue } mb, at least ${ desiredValue } mb expected` );
			return;
		}

		pass();
	},
	fix: () => {
		const desiredValue = getMemInMb() * 0.75;
		const shell = getShellRc();
		if ( shell ) {
			return `Add \`export NODE_OPTIONS=--max-old-space-size=${ desiredValue }\` to ${ shell }`;
		}
		return `Set env variable \`NODE_OPTIONS\` with value \`--max-old-space-size=${ desiredValue }\``;
	},
};
