/**
 * @jest-environment jsdom
 */
const getWebpackConfig = require( '../webpack.config' );

const mockRegisterBlockEditorFilters = jest.fn();
jest.mock( '@automattic/jetpack-ai-sidebar', () => ( {
	capabilities: {},
	contextProvider: {},
	getChatComponent: jest.fn(),
	getEmptyViewSuggestions: jest.fn(),
	registerBlockEditorFilters: mockRegisterBlockEditorFilters,
	useAbilitiesSetup: jest.fn(),
	useCheckpoint: jest.fn(),
	useSubmissionAdmission: jest.fn(),
	jetpackAiClientStateDataPartAdapter: jest.fn(),
	useWritingOnlySuggestions: jest.fn(),
	writingOnlyToolProvider: {},
} ) );

describe( 'Jetpack AI writing-only provider', () => {
	const stylesheetId = 'jetpack-ai-sidebar-limited-provider-styles';

	afterEach( () => {
		document.getElementById( stylesheetId )?.remove();
		document.documentElement.dir = '';
		delete global.agentsManagerData;
		jest.resetModules();
	} );

	it( 'uses a real ESM library output without the inherited window target', () => {
		const config = getWebpackConfig().find(
			( webpackConfig ) => webpackConfig.name === 'jetpack-ai-sidebar-limited.provider'
		);

		expect( config.experiments.outputModule ).toBe( true );
		expect( config.output.library ).toEqual( { type: 'module' } );
		expect( config.output ).not.toHaveProperty( 'libraryTarget' );
	} );

	it.each( [
		[ '', 'jetpack-ai-sidebar-limited.provider.css' ],
		[ 'rtl', 'jetpack-ai-sidebar-limited.provider.rtl.css' ],
	] )( 'loads the %s provider stylesheet beside the runtime module', ( direction, filename ) => {
		document.documentElement.dir = direction;
		global.agentsManagerData = {
			jetpackAiWritingProviderUrl:
				'https://widgets.wp.com/agents-manager/jetpack-ai-sidebar-limited.provider.mjs?ver=test#module',
		};

		jest.isolateModules( () => require( '../jetpack-ai-sidebar-limited.provider' ) );

		const stylesheet = document.getElementById( stylesheetId );
		expect( stylesheet ).toHaveAttribute(
			'href',
			`https://widgets.wp.com/agents-manager/${ filename }?ver=test`
		);
		expect( stylesheet.href ).not.toContain( 'file://' );
		expect( mockRegisterBlockEditorFilters ).toHaveBeenCalled();
	} );
} );
