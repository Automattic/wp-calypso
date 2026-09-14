/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { getEditorHistory } from '../../utils/editor-history';

const editorHistory = { navigate: jest.fn() };
const useHistory = jest.fn( () => editorHistory );
const unlock = jest.fn( () => ( { useHistory } ) );
const mockOptIn = jest.fn( () => ( { unlock } ) );

jest.mock( '@wordpress/private-apis', () => ( {
	__dangerousOptInToUnstableAPIsOnlyForCoreModules: () => mockOptIn(),
} ) );
jest.mock( '@wordpress/router', () => ( { privateApis: 'router-private-apis' } ) );

// The bridge unlocks the router once, at module load, so every consent case
// needs its own copy of it. React and the history module stay shared: a second
// React leaves the component's hooks without a dispatcher, and a second history
// module would publish where these assertions cannot see it.
const sharedElement = jest.requireActual( '@wordpress/element' );
const sharedEditorHistory = jest.requireActual( '../../utils/editor-history' );

async function renderBridge() {
	jest.resetModules();
	jest.doMock( '@wordpress/element', () => sharedElement );
	jest.doMock( '../../utils/editor-history', () => sharedEditorHistory );

	const { default: EditorHistoryBridge } = await import( '../editor-history-bridge' );

	return render( <EditorHistoryBridge /> );
}

beforeEach( () => {
	jest.clearAllMocks();
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
		const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
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
