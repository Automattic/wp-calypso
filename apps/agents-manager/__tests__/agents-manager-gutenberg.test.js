/**
 * @jest-environment jsdom
 *
 * Tests the gutenberg entry's registerPlugin wiring: the Jetpack AI Sidebar
 * preview gate decides whether the Agents Manager mounts. The entry has
 * side-effecting imports (config, the full AM bundle), so those are mocked
 * and only the registered render function is exercised.
 */

jest.mock( '../config', () => ( {} ), { virtual: true } );
jest.mock( '../agents-manager-with-provider', () => ( {
	__esModule: true,
	default: function AgentsManagerWithProvider() {
		return null;
	},
} ) );

const mockRegisterPlugin = jest.fn();
jest.mock( '@wordpress/plugins', () => ( { registerPlugin: mockRegisterPlugin } ) );

const JETPACK_PROVIDER = 'https://widgets.wp.com/agents-manager/jetpack-ai-sidebar.provider.mjs';
const JETPACK_PROVIDER_ENTRY = { providerId: 'jetpack-ai-sidebar', url: JETPACK_PROVIDER };

const loadRender = () => {
	let render;

	jest.isolateModules( () => {
		require( '../agents-manager-gutenberg' );
		render = mockRegisterPlugin.mock.calls.at( -1 )?.[ 1 ]?.render;
	} );

	return render;
};

describe( 'agents-manager-gutenberg entry', () => {
	beforeEach( () => {
		mockRegisterPlugin.mockClear();
		delete globalThis.agentsManagerData;
		delete window._currentSiteType;
	} );

	afterEach( () => {
		delete globalThis.agentsManagerData;
		delete window._currentSiteType;
	} );

	it( 'registers the jetpack-agents-manager plugin with a render function', () => {
		loadRender();

		expect( mockRegisterPlugin ).toHaveBeenCalledWith(
			'jetpack-agents-manager',
			expect.objectContaining( { render: expect.any( Function ) } )
		);
	} );

	it( 'renders nothing when the gate suppresses the mount', () => {
		globalThis.agentsManagerData = {
			sectionName: 'gutenberg',
			agentProviders: [ JETPACK_PROVIDER_ENTRY ],
		};

		const render = loadRender();

		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [] );
		expect( render() ).toBeNull();
	} );

	it( 'renders the Agents Manager when the gate allows the mount', () => {
		window._currentSiteType = 'simple';
		globalThis.agentsManagerData = {
			sectionName: 'gutenberg',
			agentProviders: [ JETPACK_PROVIDER ],
		};

		const render = loadRender();

		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [ JETPACK_PROVIDER ] );
		const result = render();
		expect( result ).not.toBeNull();
		expect( result.type.name ).toBe( 'AgentsManagerWithProvider' );
	} );
} );
