/**
 * Smoke tests for initAiBlockNotes entry point
 */

import { createRoot } from '@wordpress/element';
import { isAiBlockNotesEnabled } from './utils/feature-flag';
import { initAiBlockNotes } from './index';

jest.mock( '@wordpress/element', () => ( {
	createRoot: jest.fn(),
	StrictMode: ( { children }: { children: React.ReactNode } ) => children,
} ) );

jest.mock( './components/subscriptions', () => ( {
	default: () => null,
} ) );

jest.mock( './utils/feature-flag', () => ( {
	isAiBlockNotesEnabled: jest.fn(),
} ) );

const mockIsAiBlockNotesEnabled = isAiBlockNotesEnabled as jest.Mock;
const mockCreateRoot = createRoot as jest.Mock;
const mockRender = jest.fn();

describe( 'initAiBlockNotes', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		document.body.innerHTML = '';
		mockCreateRoot.mockReturnValue( { render: mockRender } );
	} );

	it( 'does nothing when feature flag is disabled', () => {
		mockIsAiBlockNotesEnabled.mockReturnValue( false );

		initAiBlockNotes();

		expect( mockCreateRoot ).not.toHaveBeenCalled();
		expect( document.getElementById( 'ai-block-notes-root' ) ).toBeNull();
	} );

	it( 'creates container and renders when feature flag is enabled', () => {
		mockIsAiBlockNotesEnabled.mockReturnValue( true );

		initAiBlockNotes();

		const container = document.getElementById( 'ai-block-notes-root' );
		expect( container ).not.toBeNull();
		expect( mockCreateRoot ).toHaveBeenCalledWith( container );
		expect( mockRender ).toHaveBeenCalled();
	} );

	it( 'reuses an existing container element', () => {
		mockIsAiBlockNotesEnabled.mockReturnValue( true );

		const existing = document.createElement( 'div' );
		existing.id = 'ai-block-notes-root';
		document.body.appendChild( existing );

		initAiBlockNotes();

		expect( document.querySelectorAll( '#ai-block-notes-root' ).length ).toBe( 1 );
		expect( mockCreateRoot ).toHaveBeenCalledWith( existing );
	} );
} );
