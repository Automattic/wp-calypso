/**
 * @jest-environment jsdom
 */
jest.mock( '../is-editor-page', () => ( {
	isEditorPage: jest.fn(),
} ) );

const ADMIN_BAR_IN_EDITOR_CLASS = 'has-admin-bar-in-editor';
// Saved so each suite can restore it — `setDesktop` overwrites `window.matchMedia`.
const originalMatchMedia = window.matchMedia;

type TestWindow = Window & { __experimentalAdminBarInEditor?: boolean };

function setOmnibarActive( active: boolean ) {
	( window as TestWindow ).__experimentalAdminBarInEditor = active;
}

// `isAdminBarInEditor` snapshots its result on first read, so reset the module before each test to
// re-run those tests against a fresh snapshot.
let isAdminBarInEditor: () => boolean;
let isEditorAiEntryEnabled: () => boolean;
let mockIsEditorPage: jest.Mock;

beforeEach( async () => {
	jest.resetModules();
	( { isAdminBarInEditor, isEditorAiEntryEnabled } = await import( '../editor-entry-points' ) );
	mockIsEditorPage = ( await import( '../is-editor-page' ) ).isEditorPage as unknown as jest.Mock;
} );

describe( 'isAdminBarInEditor', () => {
	afterEach( () => {
		delete ( window as TestWindow ).__experimentalAdminBarInEditor;
		document.body.classList.remove( ADMIN_BAR_IN_EDITOR_CLASS );
	} );

	it( 'returns false when neither omnibar signal is present', () => {
		expect( isAdminBarInEditor() ).toBe( false );
	} );

	it( 'returns true when window.__experimentalAdminBarInEditor is set', () => {
		setOmnibarActive( true );
		expect( isAdminBarInEditor() ).toBe( true );
	} );

	it( 'returns true when the body carries the has-admin-bar-in-editor class', () => {
		document.body.classList.add( ADMIN_BAR_IN_EDITOR_CLASS );
		expect( isAdminBarInEditor() ).toBe( true );
	} );

	it( 'returns false when the window flag is falsy and the class is absent', () => {
		setOmnibarActive( false );
		expect( isAdminBarInEditor() ).toBe( false );
	} );

	it( 'returns true when a visible #wpadminbar is present', () => {
		const adminBar = document.createElement( 'div' );
		adminBar.id = 'wpadminbar';
		// jsdom reports offsetHeight as 0, so stub a visible height.
		Object.defineProperty( adminBar, 'offsetHeight', { value: 32, configurable: true } );
		document.body.appendChild( adminBar );

		expect( isAdminBarInEditor() ).toBe( true );

		adminBar.remove();
	} );

	it( 'returns false when #wpadminbar is present but hidden', () => {
		const adminBar = document.createElement( 'div' );
		adminBar.id = 'wpadminbar';
		Object.defineProperty( adminBar, 'offsetHeight', { value: 0, configurable: true } );
		document.body.appendChild( adminBar );

		expect( isAdminBarInEditor() ).toBe( false );

		adminBar.remove();
	} );
} );

describe( 'isEditorAiEntryEnabled', () => {
	function setDesktop( matches: boolean ) {
		window.matchMedia = jest
			.fn()
			.mockReturnValue( { matches } ) as unknown as typeof window.matchMedia;
	}

	afterEach( () => {
		mockIsEditorPage.mockReset();
		delete ( window as TestWindow ).__experimentalAdminBarInEditor;
		window.matchMedia = originalMatchMedia;
	} );

	it( 'returns true on an editor page, on desktop, with the omnibar off', () => {
		mockIsEditorPage.mockReturnValue( true );
		setDesktop( true );
		expect( isEditorAiEntryEnabled() ).toBe( true );
	} );

	it( 'returns false outside an editor page', () => {
		mockIsEditorPage.mockReturnValue( false );
		setDesktop( true );
		expect( isEditorAiEntryEnabled() ).toBe( false );
	} );

	it( 'returns false on mobile', () => {
		mockIsEditorPage.mockReturnValue( true );
		setDesktop( false );
		expect( isEditorAiEntryEnabled() ).toBe( false );
	} );

	it( 'returns false when the omnibar experiment is active', () => {
		mockIsEditorPage.mockReturnValue( true );
		setDesktop( true );
		setOmnibarActive( true );
		expect( isEditorAiEntryEnabled() ).toBe( false );
	} );
} );
