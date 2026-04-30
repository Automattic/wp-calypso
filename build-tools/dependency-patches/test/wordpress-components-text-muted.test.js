const fs = require( 'fs' );
const path = require( 'path' );

const PATCH_PATH = path.join(
	__dirname,
	'../../../.yarn/patches/@wordpress-components-npm-32.1.0-dark-text-colors.patch'
);
const TEXT_STYLES_PATH = path.join(
	__dirname,
	'../../../node_modules/@wordpress/components/build/text/styles.cjs'
);

describe( '@wordpress/components Text muted color patch', () => {
	test( 'keeps deprecated __experimentalText variant="muted" using the theme gray token in production', () => {
		// Guard for the Yarn patch above: if an upgrade drops it, production muted
		// Text reverts to a fixed gray instead of the Dashboard dark-mode token.
		// Remove this test and the patch once Dashboard migrates from
		// `__experimentalText` to the `Text` component from @wordpress/ui.
		expect( fs.existsSync( PATCH_PATH ) ).toBe( true );

		jest.isolateModules( () => {
			const originalNodeEnv = process.env.NODE_ENV;

			try {
				process.env.NODE_ENV = 'production';

				const { muted } = require( TEXT_STYLES_PATH );

				expect( muted.styles ).toBe( 'color:var(--wp-components-color-gray-700, #757575);' );
			} finally {
				process.env.NODE_ENV = originalNodeEnv;
			}
		} );
	} );
} );
