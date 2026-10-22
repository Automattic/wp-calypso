const path = require( 'path' );
const base = require( '@automattic/calypso-jest' );

process.env.TZ = 'UTC';

const PATH_SEPARATOR = '[\\/\\\\]';

// Packages Jest has to transform, because the builds it resolves in jsdom are ES modules.
const ESM_PACKAGE_PATTERNS = [
	'@fnando',
	`@wordpress${ PATH_SEPARATOR }theme`,
	`(?:.*${ PATH_SEPARATOR })?uuid`,
	'@a2ui',
	`@preact${ PATH_SEPARATOR }signals-core`,
	'@?lit(?:-html|-element)?',
];

const ESM_PATTERN = ESM_PACKAGE_PATTERNS.map( ( pattern ) => pattern + PATH_SEPARATOR ).join( '|' );
const ASSET_PATTERN = '.*\\.(?:gif|jpg|jpeg|png|svg|webp|scss|mp4|sass|css)$';

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
	modulePathIgnorePatterns: [ '<rootDir>/dist' ],
	transformIgnorePatterns: [
		`node_modules${ PATH_SEPARATOR }(?!(${ ESM_PATTERN })|${ ASSET_PATTERN })`,
	],
	setupFilesAfterEnv: [ '<rootDir>../../test/packages/setup.js' ],
};
