/**
 * @jest-environment jsdom
 */

jest.mock( '../config', () => ( {} ), { virtual: true } );
jest.mock( '../agents-manager-with-provider', () => ( {
	__esModule: true,
	default: function AgentsManagerWithProvider() {
		return null;
	},
} ) );
jest.mock( '../jetpack-ai-sidebar-page-gate', () => ( {
	__esModule: true,
	default: function JetpackAiSidebarPageGate( { children } ) {
		return children;
	},
} ) );

const mockRender = jest.fn();
const mockCreateRoot = jest.fn( () => ( { render: mockRender } ) );
jest.mock( 'react-dom/client', () => ( { createRoot: mockCreateRoot } ) );

describe( 'agents-manager-wp-admin entry', () => {
	beforeEach( () => {
		mockCreateRoot.mockClear();
		mockRender.mockClear();
		document.body.innerHTML = '';
	} );

	it( 'keeps the page eligibility gate mounted around Agents Manager', () => {
		document.body.innerHTML = '<div id="agents-manager-masterbar"></div>';
		const target = document.getElementById( 'agents-manager-masterbar' );

		jest.isolateModules( () => require( '../agents-manager-wp-admin' ) );

		expect( mockCreateRoot ).toHaveBeenCalledWith( target );
		const result = mockRender.mock.calls[ 0 ][ 0 ];
		expect( result.type.name ).toBe( 'JetpackAiSidebarPageGate' );
		expect( result.props.children.type.name ).toBe( 'AgentsManagerWithProvider' );
	} );

	it( 'does not mount without the admin-bar target', () => {
		jest.isolateModules( () => require( '../agents-manager-wp-admin' ) );

		expect( mockCreateRoot ).not.toHaveBeenCalled();
		expect( mockRender ).not.toHaveBeenCalled();
	} );
} );
