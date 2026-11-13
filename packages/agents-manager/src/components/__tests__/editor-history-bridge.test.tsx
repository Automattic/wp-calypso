/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { getEditorHistory } from '../../utils/editor-history';

const editorHistory = { navigate: vi.fn() };
const useHistory = vi.fn( () => editorHistory );
const unlock = vi.fn( () => ( { useHistory } ) );
const mockOptIn = vi.fn( () => ( { unlock } ) );

vi.mock( '@wordpress/private-apis', () => ( {
	__dangerousOptInToUnstableAPIsOnlyForCoreModules: () => mockOptIn(),
} ) );
vi.mock( '@wordpress/router', () => ( { privateApis: 'router-private-apis' } ) );

// The bridge unlocks the router once, at module load, so every consent case
// needs its own copy of it. React and the history module stay shared: a second
// React leaves the component's hooks without a dispatcher, and a second history
// module would publish where these assertions cannot see it.
let sharedElement: typeof import( '@wordpress/element' );
let sharedEditorHistory: typeof import( '../../utils/editor-history' );

beforeAll( async () => {
	sharedElement = await vi.importActual( '@wordpress/element' );
	sharedEditorHistory = await vi.importActual( '../../utils/editor-history' );
} );

async function renderBridge() {
	vi.resetModules();
	vi.doMock( '@wordpress/element', () => sharedElement );
	vi.doMock( '../../utils/editor-history', () => sharedEditorHistory );

	const { default: EditorHistoryBridge } = await import( '../editor-history-bridge' );

	return render( <EditorHistoryBridge /> );
}

beforeEach( () => {
	vi.clearAllMocks();
	mockOptIn.mockImplementation( () => ( { unlock } ) );
} );

describe( 'EditorHistoryBridge', () => {
	it( 'publishes the editor history while it is mounted', async () => {
		const { unmount } = await renderBridge();

		expect( getEditorHistory() ).toBe( editorHistory );

		// Cleared on unmount, so a callback firing after the chat closes takes
		// the whole-page path instead of driving a dead router.
		unmount();
		expect( getEditorHistory() ).toBeUndefined();
	} );

	it( 'falls back to the older consent wording when the current one is rejected', async () => {
		mockOptIn.mockImplementationOnce( () => {
			throw new Error( 'wrong consent string' );
		} );

		await renderBridge();

		expect( mockOptIn ).toHaveBeenCalledTimes( 2 );
		expect( getEditorHistory() ).toBe( editorHistory );
	} );

	it( 'publishes nothing when WordPress accepts neither wording', async () => {
		const warn = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		mockOptIn.mockImplementation( () => {
			throw new Error( 'wrong consent string' );
		} );

		const { container } = await renderBridge();

		// Navigation then takes the whole-page path rather than failing.
		expect( container ).toBeEmptyDOMElement();
		expect( getEditorHistory() ).toBeUndefined();
		expect( warn ).toHaveBeenCalled();
	} );
} );
