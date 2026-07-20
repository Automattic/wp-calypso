// eslint-disable-next-line import/no-nodejs-modules
const fs = require( 'fs' );
const path = require( 'path' );
const postcss = require( 'postcss' );
const prefixSelector = require( 'postcss-prefix-selector' );
const config = require( '../reader-chat-postcss.config' );
const getWebpackConfig = require( '../webpack.config' );

describe( 'Reader Chat PostCSS scoping', () => {
	const { prefix, transform } = config.plugins[ 'postcss-prefix-selector' ];

	it( 'is configured only for the Reader Chat webpack build', () => {
		const configs = getWebpackConfig();
		const readerPostCssConfig = path.join( __dirname, '..', 'reader-chat-postcss.config.js' );
		const getPostCssConfig = ( webpackConfig ) =>
			webpackConfig.module.rules
				.flatMap( ( rule ) => rule.use || [] )
				.find( ( loader ) => loader?.loader === require.resolve( 'postcss-loader' ) )?.options
				.postcssOptions.config;
		const readerConfig = configs.find( ( webpackConfig ) => webpackConfig.entry[ 'reader-chat' ] );
		const otherConfigs = configs.filter( ( webpackConfig ) => webpackConfig !== readerConfig );

		expect( getPostCssConfig( readerConfig ) ).toBe( readerPostCssConfig );
		expect( otherConfigs.map( getPostCssConfig ) ).not.toContain( readerPostCssConfig );
	} );

	it( 'emits the Reader Chat manifest without externalizing dependencies', () => {
		const readerConfig = getWebpackConfig().find(
			( webpackConfig ) => webpackConfig.entry[ 'reader-chat' ]
		);
		const dependencyPlugin = readerConfig.plugins.find(
			( plugin ) => plugin.constructor.name === 'DependencyExtractionWebpackPlugin'
		);

		expect( dependencyPlugin.options ).toMatchObject( {
			outputFilename: '[name].asset.json',
			outputFormat: 'json',
			useDefaults: false,
		} );
	} );

	it( 'prefixes Agenttic component styles with the chat wrapper', () => {
		const filePath = require.resolve( '@automattic/agenttic-ui/index.css' );

		expect(
			transform(
				prefix,
				'.button-module_button',
				'.agents-manager-chat .button-module_button',
				filePath
			)
		).toBe( '.agents-manager-chat .button-module_button' );
	} );

	it( 'prefixes selectors in the real Agenttic stylesheet', async () => {
		const filePath = require.resolve( '@automattic/agenttic-ui/index.css' );
		const source = fs.readFileSync( filePath, 'utf8' );
		const output = await postcss( [
			prefixSelector( config.plugins[ 'postcss-prefix-selector' ] ),
		] ).process( source, { from: filePath } );
		const result = postcss.parse( output.css );
		const buttonSelectors = [];

		result.walkRules( ( rule ) => {
			buttonSelectors.push(
				...rule.selectors.filter( ( selector ) => selector.includes( '.button-module_button' ) )
			);
		} );

		expect( buttonSelectors.length ).toBeGreaterThan( 0 );
		expect( buttonSelectors.every( ( selector ) => selector.startsWith( prefix ) ) ).toBe( true );
	} );

	it( 'leaves other styles unchanged', () => {
		expect(
			transform(
				prefix,
				'.components-button',
				'.agents-manager-chat .components-button',
				'/repo/packages/components/style.scss'
			)
		).toBe( '.components-button' );
	} );
} );
