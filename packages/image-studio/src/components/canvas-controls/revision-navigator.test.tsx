/* eslint-disable import/order */
import { type MockedFunction, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock( '@wordpress/components', () => ( {
	Button: ( {
		label,
		icon,
		...props
	}: React.ButtonHTMLAttributes< HTMLButtonElement > & { label?: string; icon?: unknown } ) => (
		<button { ...props } aria-label={ props[ 'aria-label' ] ?? label } />
	),
} ) );

vi.mock( '@wordpress/compose', () => ( {
	useKeyboardShortcut: vi.fn(),
} ) );

vi.mock( '../../utils/tracking', () => ( {
	trackImageStudioRevisionNavigated: vi.fn(),
} ) );

vi.mock( '../../store', () => ( {
	store: 'image-studio',
} ) );

import { useKeyboardShortcut } from '@wordpress/compose';
import { store as coreStore } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { trackImageStudioRevisionNavigated } from '../../utils/tracking';
import { RevisionNavigator } from './revision-navigator';
import type { AttachmentRecord } from '../../types/wordpress.d';

const mockUseSelect = useSelect as MockedFunction< typeof useSelect >;
const mockUseDispatch = useDispatch as MockedFunction< typeof useDispatch >;
const mockUseKeyboardShortcut = useKeyboardShortcut as MockedFunction< typeof useKeyboardShortcut >;
const mockTrack = trackImageStudioRevisionNavigated as MockedFunction<
	typeof trackImageStudioRevisionNavigated
>;

const attachments: Record< number, AttachmentRecord > = {
	10: { id: 10, source_url: 'https://example.com/10.png', date: '2026-01-01T10:00:00' },
	11: { id: 11, source_url: 'https://example.com/11.png', date: '2026-01-01T11:00:00' },
	12: { id: 12, source_url: 'https://example.com/12.png', date: '2026-01-01T12:00:00' },
};

const mockUpdateImageStudioCanvas = vi.fn();

function setup( {
	currentAttachmentId,
	draftIds,
}: {
	currentAttachmentId: number;
	draftIds: number[];
} ) {
	const imageStudioSelectors = {
		getDraftIds: () => draftIds,
		getSavedAttachmentIds: () => [],
		getImageStudioAttachmentId: () => currentAttachmentId,
		getOriginalAttachmentId: () => 10,
		getAnnotatedAttachmentIds: () => [],
	};
	const coreSelectors = {
		getEntityRecord: ( _kind: string, _name: string, id: number ) => attachments[ id ],
	};
	const select = ( store: unknown ) =>
		store === coreStore ? coreSelectors : imageStudioSelectors;

	mockUseSelect.mockImplementation( ( selector ) =>
		( selector as ( s: typeof select ) => unknown )( select )
	);
	mockUseDispatch.mockReturnValue( {
		updateImageStudioCanvas: mockUpdateImageStudioCanvas,
	} as unknown as ReturnType< typeof useDispatch > );

	return render( <RevisionNavigator /> );
}

function getShortcut( key: string ) {
	const call = mockUseKeyboardShortcut.mock.calls.findLast( ( [ shortcut ] ) => shortcut === key );
	if ( ! call ) {
		throw new Error( `No ${ key } shortcut registered` );
	}
	return {
		callback: call[ 1 ] as () => void,
		isDisabled: ( call[ 2 ] as { isDisabled: boolean } ).isDisabled,
	};
}

describe( 'RevisionNavigator', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'renders nothing with a single revision', () => {
		const { container } = setup( { currentAttachmentId: 10, draftIds: [] } );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'shows the position and disables previous at the first revision', () => {
		setup( { currentAttachmentId: 10, draftIds: [ 11, 12 ] } );

		expect( screen.getByText( /1\s*\/\s*3/ ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Previous revision' } ) ).toBeDisabled();
		expect( screen.getByRole( 'button', { name: 'Next revision' } ) ).toBeEnabled();
		expect( getShortcut( 'left' ).isDisabled ).toBe( true );
		expect( getShortcut( 'right' ).isDisabled ).toBe( false );
	} );

	it( 'disables next at the latest revision', () => {
		setup( { currentAttachmentId: 12, draftIds: [ 11, 12 ] } );

		expect( screen.getByRole( 'button', { name: 'Previous revision' } ) ).toBeEnabled();
		expect( screen.getByRole( 'button', { name: 'Next revision' } ) ).toBeDisabled();
		expect( getShortcut( 'left' ).isDisabled ).toBe( false );
		expect( getShortcut( 'right' ).isDisabled ).toBe( true );
	} );

	it( 'moves the canvas and tracks the buttons', async () => {
		setup( { currentAttachmentId: 11, draftIds: [ 11, 12 ] } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Previous revision' } ) );
		expect( mockUpdateImageStudioCanvas ).toHaveBeenLastCalledWith(
			'https://example.com/10.png',
			10,
			false
		);
		expect( mockTrack ).toHaveBeenLastCalledWith( { direction: 'previous', source: 'button' } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Next revision' } ) );
		expect( mockUpdateImageStudioCanvas ).toHaveBeenLastCalledWith(
			'https://example.com/12.png',
			12,
			false
		);
		expect( mockTrack ).toHaveBeenLastCalledWith( { direction: 'next', source: 'button' } );
	} );

	it( 'moves the canvas and tracks the arrow keys', () => {
		setup( { currentAttachmentId: 11, draftIds: [ 11, 12 ] } );

		getShortcut( 'left' ).callback();
		expect( mockUpdateImageStudioCanvas ).toHaveBeenLastCalledWith(
			'https://example.com/10.png',
			10,
			false
		);
		expect( mockTrack ).toHaveBeenLastCalledWith( { direction: 'previous', source: 'keyboard' } );

		getShortcut( 'right' ).callback();
		expect( mockUpdateImageStudioCanvas ).toHaveBeenLastCalledWith(
			'https://example.com/12.png',
			12,
			false
		);
		expect( mockTrack ).toHaveBeenLastCalledWith( { direction: 'next', source: 'keyboard' } );
	} );
} );
