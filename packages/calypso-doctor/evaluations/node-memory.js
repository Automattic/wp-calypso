const { getShellRc, getMemInMb } = require( '../lib' );

module.exports = {
	title: 'Node memory',
	group: 'Node.js',
	description:
		'Sets the maximum size of Node.js heap. As memory consumption approaches this limit, Node.js will spend more time on garbage collection in an effort to free unused memory.',
	test: () => {
		if ( ! process.env.NODE_OPTIONS ) {
			return { result: false, message: 'NODE_OPTIONS is not set' };
		}

		const match = process.env.NODE_OPTIONS.match( /--max-old-space-size=([0-9]+)/ );
		if ( ! match ) {
			return { result: false, message: 'max-old-space-size not set' };
		}

		const currentValue = Number( match[ 1 ] );
		const desiredValue = getMemInMb() * 0.75;
		if ( desiredValue !== currentValue ) {
			return {
				result: false,
				message: `Memory set to ${ currentValue } mb, ${ desiredValue } mb expected`,
			};
		}

		return { result: true };
	},
	fix: () => {
		const desiredValue = getMemInMb() * 0.75;
		const shell = getShellRc();
		return `Add \`NODE_OPTIONS=--max-old-space-size=${ desiredValue }\` to ${ shell }`;
	},
};
