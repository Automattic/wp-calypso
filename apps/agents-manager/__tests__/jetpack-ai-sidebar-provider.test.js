/**
 * @jest-environment jsdom
 */

const mockRegisterBlockEditorFilters = jest.fn();
const mockUseJetpackFreeCreditChatNotice = jest.fn();

jest.mock( '@automattic/jetpack-ai-sidebar', () => ( {
	capabilities: {},
	contextProvider: {},
	getChatComponent: jest.fn(),
	getEmptyViewSuggestions: jest.fn(),
	registerBlockEditorFilters: mockRegisterBlockEditorFilters,
	toolProvider: {},
	useAbilitiesSetup: jest.fn(),
	useCheckpoint: jest.fn(),
	useJetpackFreeCreditChatNotice: mockUseJetpackFreeCreditChatNotice,
	useSuggestions: jest.fn(),
} ) );

describe( 'Jetpack AI provider', () => {
	afterEach( () => {
		delete window.__JetpackAIProvider;
		jest.resetModules();
	} );

	it( 'exposes the platform-aware free-credit notice hook', () => {
		jest.isolateModules( () => require( '../jetpack-ai-sidebar' ) );

		expect( window.__JetpackAIProvider ).toEqual(
			expect.objectContaining( {
				useChatNotice: mockUseJetpackFreeCreditChatNotice,
			} )
		);
		expect( mockRegisterBlockEditorFilters ).toHaveBeenCalled();
	} );
} );
