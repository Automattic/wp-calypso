/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line import/no-nodejs-modules
const fs = require( 'fs' );
const path = require( 'path' );

jest.mock( '../config', () => ( {} ), { virtual: true } );
jest.mock( '@automattic/agents-manager/src/writing-only', () => () => null, { virtual: true } );

const mockRegisterPlugin = jest.fn();
jest.mock( '@wordpress/plugins', () => ( { registerPlugin: mockRegisterPlugin } ) );

describe( 'writing-only Gutenberg entry', () => {
	it( 'registers a dedicated plugin render without importing the full app or generic providers', () => {
		jest.isolateModules( () => require( '../agents-manager-gutenberg-jetpack-ai' ) );

		expect( mockRegisterPlugin ).toHaveBeenCalledWith(
			'jetpack-agents-manager',
			expect.objectContaining( { render: expect.any( Function ) } )
		);
		const source = fs.readFileSync(
			path.join( __dirname, '../agents-manager-gutenberg-jetpack-ai.jsx' ),
			'utf8'
		);
		expect( source ).toContain( 'jetpackAiWritingProviderUrl' );
		expect( source ).toContain( "'jetpack-ai-sidebar-limited'" );
		expect( source ).not.toContain( 'agents-manager-with-provider' );
		expect( source ).not.toContain( "from '@automattic/agents-manager'" );
		expect( source ).not.toContain( 'agentProviders' );
		expect( source ).not.toContain( 'big-sky' );

		const writingOnlySource = fs.readFileSync(
			path.join( __dirname, '../../../packages/agents-manager/src/writing-only.tsx' ),
			'utf8'
		);
		expect( writingOnlySource ).toContain( "import './components/agent-dock/style.scss';" );

		const webpackSource = fs.readFileSync( path.join( __dirname, '../webpack.config.js' ), 'utf8' );
		expect( webpackSource ).toContain(
			"resource?.endsWith( '/components/agent-dock/style.scss' )"
		);
		expect( webpackSource ).toContain( "this.entryName === 'agents-manager-gutenberg-jetpack-ai'" );
	} );
} );
