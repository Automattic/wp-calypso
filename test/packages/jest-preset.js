const path = require( 'path' );
const base = require( '@automattic/calypso-jest' );

process.env.TZ = 'UTC';

/**
 * Can't use `preset: '@automattic/calypso-jest'` because preset are not recursive. In other words,
 * if this config contains `preset`, then it can't be consumed as a preset by anybody else.
 */
module.exports = {
	...base,
	cacheDirectory: path.join( __dirname, '../../.cache/jest' ),
	globals: {
		__i18n_text_domain__: 'default',
	},
	setupFilesAfterEnv: [ '<rootDir>../../test/packages/setup.js' ],
};
