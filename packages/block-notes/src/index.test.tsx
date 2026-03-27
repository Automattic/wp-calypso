/**
 * Smoke tests for initBlockNotes entry point
 */

import { createRoot } from '@wordpress/element';
import { areBlockNotesEnabled } from './utils/feature-flag';
import { initBlockNotes } from './index';

jest.mock( '@wordpress/element', () => ( {
	createRoot: jest.fn(),
	StrictMode: ( { children }: { children: React.ReactNode } ) => children,
} ) );

jest.mock( './components/subscriptions', () => ( {
	default: () => null,
} ) );

jest.mock( './utils/feature-flag', () => ( {
	areBlockNotesEnabled: jest.fn(),
} ) );

const mockAreBlockNotesEnabled = areBlockNotesEnabled as jest.Mock;
const mockCreateRoot = createRoot as jest.Mock;
const mockRender = jest.fn();

describe( 'initBlockNotes', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		document.body.innerHTML = '';
		mockCreateRoot.mockReturnValue( { render: mockRender } );
	} );

	it( 'does nothing when feature flag is disabled', () => {
		mockAreBlockNotesEnabled.mockReturnValue( false );

		initBlockNotes();

		expect( mockCreateRoot ).not.toHaveBeenCalled();
		expect( document.getElementById( 'big-sky-block-notes-root' ) ).toBeNull();
	} );

	it( 'creates container and renders when feature flag is enabled', () => {
		mockAreBlockNotesEnabled.mockReturnValue( true );

		initBlockNotes();

		const container = document.getElementById( 'big-sky-block-notes-root' );
		expect( container ).not.toBeNull();
		expect( mockCreateRoot ).toHaveBeenCalledWith( container );
		expect( mockRender ).toHaveBeenCalled();
	} );

	it( 'reuses an existing container element', () => {
		mockAreBlockNotesEnabled.mockReturnValue( true );

		const existing = document.createElement( 'div' );
		existing.id = 'big-sky-block-notes-root';
		document.body.appendChild( existing );

		initBlockNotes();

		expect( document.querySelectorAll( '#big-sky-block-notes-root' ).length ).toBe( 1 );
		expect( mockCreateRoot ).toHaveBeenCalledWith( existing );
	} );
} );
