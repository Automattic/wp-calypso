/**
 * @jest-environment node
 */

const path = require( 'path' );
const postcss = require( 'postcss' );

const helpCenterPostcssConfig = require(
	path.join( __dirname, '../../../../apps/help-center/postcss.config.js' )
);

describe( 'Help Center PostCSS scoping', () => {
	it( 'prefixes `.chart-container` selectors to avoid leaking into wp-admin pages', async () => {
		const inputCss = '.chart-container{z-index:1001;}';

		const result = await postcss( helpCenterPostcssConfig.plugins ).process( inputCss, {
			// Mimic a dependency stylesheet path.
			from: '/tmp/node_modules/@automattic/agenttic-ui/dist/index.css',
		} );

		expect( result.css ).toContain( '.help-center .chart-container' );
	} );
} );
