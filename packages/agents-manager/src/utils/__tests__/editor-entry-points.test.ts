/**
 * @jest-environment jsdom
 */
import {
	isAdminBarInEditor,
	isEditorAiEntryEnabled,
	isEditorHelpMenuEnabled,
} from '../editor-entry-points';
import { getAgentsManagerInlineData } from '../get-agents-manager-inline-data';
import { isEditorPage } from '../is-editor-page';

jest.mock( '../get-agents-manager-inline-data', () => ( {
	getAgentsManagerInlineData: jest.fn(),
} ) );
jest.mock( '../is-editor-page', () => ( {
	isEditorPage: jest.fn(),
} ) );

const mockInlineData = getAgentsManagerInlineData as jest.Mock;
const mockIsEditorPage = isEditorPage as jest.Mock;
const ADMIN_BAR_IN_EDITOR_CLASS = 'has-admin-bar-in-editor';
// Saved so each suite can restore it — `setDesktop` overwrites `window.matchMedia`.
const originalMatchMedia = window.matchMedia;

type TestWindow = Window & { __experimentalAdminBarInEditor?: boolean };

function setOmnibarActive( active: boolean ) {
	( window as TestWindow ).__experimentalAdminBarInEditor = active;
}

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
} );

describe( 'isEditorAiEntryEnabled', () => {
	function setDesktop( matches: boolean ) {
		window.matchMedia = jest
			.fn()
			.mockReturnValue( { matches } ) as unknown as typeof window.matchMedia;
	}

	afterEach( () => {
		mockInlineData.mockReset();
		mockIsEditorPage.mockReset();
		delete ( window as TestWindow ).__experimentalAdminBarInEditor;
		window.matchMedia = originalMatchMedia;
	} );

	it( 'returns true on an editor page, in a dev context, on desktop, with the omnibar off', () => {
		mockIsEditorPage.mockReturnValue( true );
		mockInlineData.mockReturnValue( { isDevMode: true } );
		setDesktop( true );
		expect( isEditorAiEntryEnabled() ).toBe( true );
	} );

	it( 'returns false outside an editor page', () => {
		mockIsEditorPage.mockReturnValue( false );
		mockInlineData.mockReturnValue( { isDevMode: true } );
		setDesktop( true );
		expect( isEditorAiEntryEnabled() ).toBe( false );
	} );

	it( 'returns false outside dev mode', () => {
		mockIsEditorPage.mockReturnValue( true );
		mockInlineData.mockReturnValue( { isDevMode: false } );
		setDesktop( true );
		expect( isEditorAiEntryEnabled() ).toBe( false );
	} );

	it( 'returns false on mobile', () => {
		mockIsEditorPage.mockReturnValue( true );
		mockInlineData.mockReturnValue( { isDevMode: true } );
		setDesktop( false );
		expect( isEditorAiEntryEnabled() ).toBe( false );
	} );

	it( 'returns false when the omnibar experiment is active', () => {
		mockIsEditorPage.mockReturnValue( true );
		mockInlineData.mockReturnValue( { isDevMode: true } );
		setDesktop( true );
		setOmnibarActive( true );
		expect( isEditorAiEntryEnabled() ).toBe( false );
	} );
} );

describe( 'isEditorHelpMenuEnabled', () => {
	function setDesktop( matches: boolean ) {
		window.matchMedia = jest
			.fn()
			.mockReturnValue( { matches } ) as unknown as typeof window.matchMedia;
	}

	afterEach( () => {
		mockInlineData.mockReset();
		mockIsEditorPage.mockReset();
		delete ( window as TestWindow ).__experimentalAdminBarInEditor;
		window.matchMedia = originalMatchMedia;
	} );

	it( 'returns true on an editor page, on desktop, in the unified experience', () => {
		mockIsEditorPage.mockReturnValue( true );
		mockInlineData.mockReturnValue( { useUnifiedExperience: true } );
		setDesktop( true );
		expect( isEditorHelpMenuEnabled() ).toBe( true );
	} );

	it( 'returns false outside the unified experience', () => {
		mockIsEditorPage.mockReturnValue( true );
		mockInlineData.mockReturnValue( { useUnifiedExperience: false } );
		setDesktop( true );
		expect( isEditorHelpMenuEnabled() ).toBe( false );
	} );

	it( 'returns false outside an editor page', () => {
		mockIsEditorPage.mockReturnValue( false );
		mockInlineData.mockReturnValue( { useUnifiedExperience: true } );
		setDesktop( true );
		expect( isEditorHelpMenuEnabled() ).toBe( false );
	} );

	it( 'returns false on mobile', () => {
		mockIsEditorPage.mockReturnValue( true );
		mockInlineData.mockReturnValue( { useUnifiedExperience: true } );
		setDesktop( false );
		expect( isEditorHelpMenuEnabled() ).toBe( false );
	} );

	it( 'returns false when the omnibar experiment is active', () => {
		mockIsEditorPage.mockReturnValue( true );
		mockInlineData.mockReturnValue( { useUnifiedExperience: true } );
		setDesktop( true );
		setOmnibarActive( true );
		expect( isEditorHelpMenuEnabled() ).toBe( false );
	} );
} );
