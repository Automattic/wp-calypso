// The client directories whose tests run on Vitest, relative to `client/`. Jest skips their tests,
// Vitest runs them and ESLint bans the `jest` global in them, so a test can't end up in neither
// runner. Delete this file once every directory has moved and `yarn test-client` runs Vitest.
const path = require( 'node:path' );

const directories = [
	'state/a8c-for-agencies',
	'state/account',
	'state/account-recovery',
	'state/action-log',
	'state/action-watchers',
	'state/active-promotions',
	'state/activity-log',
	'state/admin-menu',
	'state/admin-sidebar',
	'state/analytics',
	'state/atomic-transfer',
	'state/automated-transfer',
	'state/cancellation-offers',
	'state/comments',
	'state/concierge',
	'state/connected-applications',
	'state/country-states',
	'state/currency-code',
	'state/current-user',
	'state/difm',
	'state/document-head',
	'state/domains',
	'state/editor',
	'state/email-accounts',
	'state/global-sidebar',
	'state/google-my-business',
	'state/gravatar-status',
	'state/guided-tours',
	'state/hosting',
	'state/i18n',
	'state/immediate-login',
	'state/imports',
	'state/invites',
	'state/jetpack',
	'state/jetpack-connect',
	'state/jetpack-connection-health',
	'state/jetpack-product-install',
	'state/jetpack-remote-install',
	'state/jetpack-review-prompt',
	'state/jetpack-sync',
	'state/login',
];

// Test files in `directories` that stay on Jest until a fix lands, relative to `client/`.
const onJest = [];

for ( const file of onJest ) {
	if ( ! directories.some( ( dir ) => file.startsWith( dir + '/' ) ) ) {
		throw new Error( `${ file } is listed to stay on Jest, but no Vitest directory contains it.` );
	}
}

const escapeRegExp = ( s ) => s.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );

// Jest's `testMatch`.
const vitestInclude = directories.map( ( dir ) => path.posix.join( dir, '**/test/*.[jt]s?(x)' ) );
const vitestExclude = onJest;

const jestIgnorePatterns = directories.map( ( dir ) => {
	const kept = onJest
		.filter( ( file ) => file.startsWith( dir + '/' ) )
		.map( ( file ) => escapeRegExp( file.slice( dir.length + 1 ) ) );
	const pattern = `^<rootDir>/${ escapeRegExp( dir ) }/`;
	return kept.length ? `${ pattern }(?!(?:${ kept.join( '|' ) })$)` : pattern;
} );

// Test files and the helpers next to them.
const eslintFiles = directories.map( ( dir ) =>
	path.posix.join( dir, '**/test/**/*.{js,jsx,ts,tsx}' )
);
const eslintIgnores = onJest;

// Shorthand properties, so that ES modules can import them by name.
module.exports = {
	directories,
	onJest,
	vitestInclude,
	vitestExclude,
	jestIgnorePatterns,
	eslintFiles,
	eslintIgnores,
};
