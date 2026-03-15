/* eslint-disable import/order */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Mock dependencies - MUST be before imports that use them
jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn(),
	useSelect: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

jest.mock( '../../utils/tracking', () => ( {
	trackImageStudioSidebarClose: jest.fn(),
	trackImageStudioMetadataUpdated: jest.fn(),
} ) );

jest.mock( './editable-field', () => {
	const { useState } = require( '@wordpress/element' );
	return {
		EditableField: ( {
			label,
			value,
			onSave,
		}: {
			label: string;
			value: string;
			onSave: ( value: string ) => void;
		} ) => {
			const [ localValue, setLocalValue ] = useState( value );
			return (
				<div data-testid={ `editable-field-${ label.toLowerCase() }` }>
					<label>{ label }</label>
					<input
						value={ localValue }
						onChange={ ( e ) => setLocalValue( e.target.value ) }
						onBlur={ () => onSave( localValue ) }
						data-testid={ `input-${ label.toLowerCase() }` }
					/>
				</div>
			);
		},
	};
} );

jest.mock( './file-details', () => ( {
	FileDetails: ( { attachmentId }: { attachmentId: number } ) => (
		<div data-testid="file-details">File Details: { attachmentId }</div>
	),
} ) );

jest.mock( '../confirmation-dialog', () => ( {
	ConfirmationDialog: ( { isOpen, title, children, actions }: any ) =>
		isOpen ? (
			<div role="dialog">
				<h2>{ title }</h2>
				<div>{ children }</div>
				{ actions.map( ( action: any, index: number ) => (
					<button key={ index } onClick={ action.onClick }>
						{ action.text }
					</button>
				) ) }
			</div>
		) : null,
} ) );

jest.mock( '../../store', () => ( {
	store: 'image-studio',
} ) );

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		text,
		icon,
		label,
		variant,
		isDestructive,
		showTooltip,
		accessibleWhenDisabled,
		...props
	}: any ) => (
		<button { ...props } aria-label={ label }>
			{ children || text }
		</button>
	),
	Icon: ( { icon }: any ) => <span>{ icon }</span>,
} ) );

// Import after mocks
import { useDispatch, useSelect } from '@wordpress/data';
import { MetadataField } from '../../types';
import {
	trackImageStudioMetadataUpdated,
	trackImageStudioSidebarClose,
} from '../../utils/tracking';
import { ImageStudioAltTextSidebar, ImageStudioSidebar } from './index';

const mockUseDispatch = useDispatch as jest.MockedFunction< typeof useDispatch >;
const mockUseSelect = useSelect as jest.MockedFunction< typeof useSelect >;
const mockTrackSidebarClose = trackImageStudioSidebarClose as jest.MockedFunction<
	typeof trackImageStudioSidebarClose
>;
const mockTrackMetadataUpdated = trackImageStudioMetadataUpdated as jest.MockedFunction<
	typeof trackImageStudioMetadataUpdated
>;

describe( 'ImageStudioSidebar', () => {
	const defaultProps = {
		onClose: jest.fn(),
		title: 'Test Sidebar',
		children: <div>Test Content</div>,
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Rendering', () => {
		it( 'renders sidebar with title and children', () => {
			render( <ImageStudioSidebar { ...defaultProps } /> );

			expect( screen.getByText( 'Test Sidebar' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Test Content' ) ).toBeInTheDocument();
		} );

		it( 'renders close button', () => {
			render( <ImageStudioSidebar { ...defaultProps } /> );

			expect( screen.getByLabelText( 'Close sidebar' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Interactions', () => {
		it( 'calls onClose and tracks event when close button is clicked', async () => {
			const onClose = jest.fn();
			const user = userEvent.setup();

			render( <ImageStudioSidebar { ...defaultProps } onClose={ onClose } /> );

			await user.click( screen.getByLabelText( 'Close sidebar' ) );

			expect( onClose ).toHaveBeenCalledTimes( 1 );
			expect( mockTrackSidebarClose ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );

describe( 'ImageStudioAltTextSidebar', () => {
	const defaultProps = {
		onClose: jest.fn(),
	};

	const mockSetHasUpdatedMetadata = jest.fn();
	const mockSetCanvasMetadata = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();

		mockUseDispatch.mockReturnValue( {
			setHasUpdatedMetadata: mockSetHasUpdatedMetadata,
			setCanvasMetadata: mockSetCanvasMetadata,
		} as any );

		mockUseSelect.mockImplementation( ( selector: any ) => {
			const result = selector( () => ( {
				getImageStudioAttachmentId: () => 123,
				getCanvasMetadata: () => ( {
					title: 'Test Title',
					caption: 'Test Caption',
					description: 'Test Description',
					alt_text: 'Test Alt Text',
				} ),
			} ) );
			return result;
		} );
	} );

	describe( 'Rendering', () => {
		it( 'renders alt text sidebar with title', () => {
			render( <ImageStudioAltTextSidebar { ...defaultProps } /> );

			expect( screen.getByText( 'Image Info' ) ).toBeInTheDocument();
		} );

		it( 'renders all metadata fields', () => {
			render( <ImageStudioAltTextSidebar { ...defaultProps } /> );

			expect( screen.getByTestId( 'editable-field-title' ) ).toBeInTheDocument();
			expect( screen.getByTestId( 'editable-field-caption' ) ).toBeInTheDocument();
			expect( screen.getByTestId( 'editable-field-description' ) ).toBeInTheDocument();
			expect( screen.getByTestId( 'editable-field-alt text' ) ).toBeInTheDocument();
		} );

		it( 'renders help text for alt text', () => {
			render( <ImageStudioAltTextSidebar { ...defaultProps } /> );

			expect( screen.getByText( /Alt text describes the image's purpose/ ) ).toBeInTheDocument();
			expect( screen.getByText( 'Learn more' ) ).toBeInTheDocument();
		} );

		it( 'renders file details when attachmentId is present', () => {
			render( <ImageStudioAltTextSidebar { ...defaultProps } /> );

			expect( screen.getByTestId( 'file-details' ) ).toBeInTheDocument();
			expect( screen.getByText( 'File Details: 123' ) ).toBeInTheDocument();
		} );

		it( 'does not render file details when attachmentId is null', () => {
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getImageStudioAttachmentId: () => null,
					getCanvasMetadata: () => ( {} ),
				} ) );
				return result;
			} );

			render( <ImageStudioAltTextSidebar { ...defaultProps } /> );

			expect( screen.queryByTestId( 'file-details' ) ).not.toBeInTheDocument();
		} );

		it( 'renders delete button when onDeletePermanently is provided', () => {
			const onDeletePermanently = jest.fn();

			render(
				<ImageStudioAltTextSidebar
					{ ...defaultProps }
					onDeletePermanently={ onDeletePermanently }
					canDeletePermanently
				/>
			);

			expect( screen.getByRole( 'button', { name: 'Delete permanently' } ) ).toBeInTheDocument();
		} );

		it( 'does not render delete button when onDeletePermanently is not provided', () => {
			render( <ImageStudioAltTextSidebar { ...defaultProps } /> );

			expect(
				screen.queryByRole( 'button', { name: 'Delete permanently' } )
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'Metadata Updates', () => {
		it( 'updates canvas metadata when field is saved', async () => {
			const user = userEvent.setup();
			render( <ImageStudioAltTextSidebar { ...defaultProps } /> );

			const titleInput = screen.getByTestId( 'input-title' );

			// Simulate changing the title
			await user.clear( titleInput );
			await user.type( titleInput, 'New Title' );
			await user.tab(); // Trigger blur by moving focus

			await waitFor( () => {
				expect( mockSetCanvasMetadata ).toHaveBeenCalledWith(
					expect.objectContaining( {
						title: 'New Title',
					} )
				);
			} );
		} );

		it( 'sets hasUpdatedMetadata flag when field is saved', async () => {
			const user = userEvent.setup();
			render( <ImageStudioAltTextSidebar { ...defaultProps } /> );

			const titleInput = screen.getByTestId( 'input-title' );

			// Simulate changing the title
			await user.clear( titleInput );
			await user.type( titleInput, 'New Title' );
			await user.tab(); // Trigger blur by moving focus

			await waitFor( () => {
				expect( mockSetHasUpdatedMetadata ).toHaveBeenCalledWith( true );
			} );
		} );

		it( 'tracks metadata update with correct field and attachment ID', async () => {
			const user = userEvent.setup();
			render( <ImageStudioAltTextSidebar { ...defaultProps } /> );

			const titleInput = screen.getByTestId( 'input-title' );

			// Simulate changing the title
			await user.clear( titleInput );
			await user.type( titleInput, 'New Title' );
			await user.tab(); // Trigger blur by moving focus

			await waitFor( () => {
				expect( mockTrackMetadataUpdated ).toHaveBeenCalledWith( {
					attachmentId: 123,
					field: MetadataField.Title,
				} );
			} );
		} );

		it( 'preserves existing metadata when updating a single field', async () => {
			const user = userEvent.setup();
			render( <ImageStudioAltTextSidebar { ...defaultProps } /> );

			const titleInput = screen.getByTestId( 'input-title' );

			// Simulate changing the title
			await user.clear( titleInput );
			await user.type( titleInput, 'New Title' );
			await user.tab(); // Trigger blur by moving focus

			await waitFor( () => {
				expect( mockSetCanvasMetadata ).toHaveBeenCalledWith( {
					title: 'New Title',
					caption: 'Test Caption',
					description: 'Test Description',
					alt_text: 'Test Alt Text',
				} );
			} );
		} );
	} );

	describe( 'Delete Functionality', () => {
		it( 'disables delete button when canDeletePermanently is false', () => {
			const onDeletePermanently = jest.fn();

			render(
				<ImageStudioAltTextSidebar
					{ ...defaultProps }
					onDeletePermanently={ onDeletePermanently }
					canDeletePermanently={ false }
				/>
			);

			// When disabled, the button shows the tooltip as the label
			expect( screen.getByLabelText( 'Save or discard your changes' ) ).toBeDisabled();
		} );

		it( 'shows confirmation dialog when delete button is clicked', async () => {
			const onDeletePermanently = jest.fn();
			const user = userEvent.setup();

			render(
				<ImageStudioAltTextSidebar
					{ ...defaultProps }
					onDeletePermanently={ onDeletePermanently }
					canDeletePermanently
				/>
			);

			await user.click( screen.getByRole( 'button', { name: 'Delete permanently' } ) );

			expect( screen.getByText( 'Delete this item' ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					/You are about to permanently delete this item from your site. This action cannot be undone./
				)
			).toBeInTheDocument();
		} );

		it( 'closes confirmation dialog when Cancel is clicked', async () => {
			const onDeletePermanently = jest.fn();
			const user = userEvent.setup();

			render(
				<ImageStudioAltTextSidebar
					{ ...defaultProps }
					onDeletePermanently={ onDeletePermanently }
					canDeletePermanently
				/>
			);

			// Open dialog
			await user.click( screen.getByRole( 'button', { name: 'Delete permanently' } ) );

			expect( screen.getByText( 'Delete this item' ) ).toBeInTheDocument();

			// Click cancel
			await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

			// Dialog should be closed
			await waitFor( () => {
				expect( screen.queryByText( 'Delete this item' ) ).not.toBeInTheDocument();
			} );

			expect( onDeletePermanently ).not.toHaveBeenCalled();
		} );

		it( 'calls onDeletePermanently when confirmed', async () => {
			const onDeletePermanently = jest.fn().mockResolvedValue( undefined );
			const user = userEvent.setup();

			render(
				<ImageStudioAltTextSidebar
					{ ...defaultProps }
					onDeletePermanently={ onDeletePermanently }
					canDeletePermanently
				/>
			);

			// Open dialog
			await user.click( screen.getByRole( 'button', { name: /Delete permanently/ } ) );

			// Confirm deletion - find the button within the dialog
			const confirmButtons = screen.getAllByRole( 'button', { name: 'Delete permanently' } );
			const confirmButton = confirmButtons.find( ( button ) => {
				// The confirm button should be the one inside the dialog (has isDestructive variant)
				return button.closest( '[role="dialog"]' ) !== null;
			} );

			if ( confirmButton ) {
				await user.click( confirmButton );
			}

			await waitFor( () => {
				expect( onDeletePermanently ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		it( 'closes dialog before calling onDeletePermanently', async () => {
			const deletePromise = new Promise< void >( ( resolve ) => {
				// resolve stored but not used — promise stays pending to test intermediate state
				void resolve;
			} );

			const onDeletePermanently = jest.fn().mockReturnValue( deletePromise );
			const user = userEvent.setup();

			render(
				<ImageStudioAltTextSidebar
					{ ...defaultProps }
					onDeletePermanently={ onDeletePermanently }
					canDeletePermanently
				/>
			);

			// Open dialog
			await user.click( screen.getByRole( 'button', { name: /Delete permanently/ } ) );

			// Confirm deletion
			const confirmButtons = screen.getAllByRole( 'button', { name: 'Delete permanently' } );
			const confirmButton = confirmButtons.find( ( button ) => {
				return button.closest( '[role="dialog"]' ) !== null;
			} );

			if ( confirmButton ) {
				await user.click( confirmButton );
			}

			// Dialog should close immediately
			await waitFor( () => {
				expect( screen.queryByText( 'Delete this item' ) ).not.toBeInTheDocument();
			} );

			// And deletion should be in progress
			expect( onDeletePermanently ).toHaveBeenCalled();
		} );
	} );

	describe( 'Edge Cases', () => {
		it( 'handles missing canvas metadata gracefully', () => {
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getImageStudioAttachmentId: () => 123,
					getCanvasMetadata: () => null,
				} ) );
				return result;
			} );

			render( <ImageStudioAltTextSidebar { ...defaultProps } /> );

			// Should render with empty values
			expect( screen.getByTestId( 'editable-field-title' ) ).toBeInTheDocument();
		} );

		it( 'does not save metadata when attachmentId is null', async () => {
			const user = userEvent.setup();
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getImageStudioAttachmentId: () => null,
					getCanvasMetadata: () => ( {} ),
				} ) );
				return result;
			} );

			render( <ImageStudioAltTextSidebar { ...defaultProps } /> );

			const titleInput = screen.getByTestId( 'input-title' );

			// Simulate changing the title
			await user.clear( titleInput );
			await user.type( titleInput, 'New Title' );
			await user.tab(); // Trigger blur by moving focus

			// Should not update metadata without attachmentId
			expect( mockSetCanvasMetadata ).not.toHaveBeenCalled();
		} );
	} );
} );
