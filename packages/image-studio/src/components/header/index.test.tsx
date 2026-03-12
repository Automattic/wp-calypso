/* eslint-disable import/order */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Mock dependencies - MUST be before imports that use them
jest.mock( '@automattic/agenttic-ui', () => ( {
	cn: ( ...args: any[] ) => {
		return args
			.map( ( arg ) => {
				if ( typeof arg === 'string' ) {
					return arg;
				}
				if ( typeof arg === 'object' && arg !== null ) {
					return Object.keys( arg )
						.filter( ( key ) => arg[ key ] )
						.join( ' ' );
				}
				return '';
			} )
			.filter( Boolean )
			.join( ' ' );
	},
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn(),
	useSelect: jest.fn(),
} ) );

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		text,
		icon,
		label,
		variant,
		isBusy,
		isPressed,
		showTooltip,
		accessibleWhenDisabled,
		...props
	}: any ) => (
		<button { ...props } aria-label={ label } aria-pressed={ isPressed }>
			{ children || text }
		</button>
	),
	Icon: ( { icon }: any ) => <span>{ icon }</span>,
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	sprintf: ( format: string, ...args: any[] ) => {
		let result = format;
		args.forEach( ( arg ) => {
			result = result.replace( /%s|%d|%\d\$s|%\d\$d/, String( arg ) );
		} );
		return result;
	},
} ) );

jest.mock( '@wordpress/compose', () => ( {
	useKeyboardShortcut: jest.fn(),
} ) );

jest.mock( '@wordpress/keycodes', () => ( {
	isAppleOS: jest.fn( () => true ),
} ) );

jest.mock( '../../utils/tracking', () => ( {
	trackImageStudioToolClick: jest.fn(),
} ) );

jest.mock( '../../store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: {
		MediaLibrary: 'media_library',
		EditorBlock: 'editor_block',
		EditorSidebar: 'editor_sidebar',
		JetpackExternalMediaBlock: 'jetpack_external_media_block',
		JetpackExternalMediaFeaturedImage: 'jetpack_external_media_featured_image',
	},
} ) );

// Import after mocks
import { useDispatch, useSelect } from '@wordpress/data';
import { ImageStudioEntryPoint } from '../../store';
import { ImageStudioMode, ToolbarOption } from '../../types';
import { trackImageStudioToolClick } from '../../utils/tracking';
import { Header } from './index';

const mockUseDispatch = useDispatch as jest.MockedFunction< typeof useDispatch >;
const mockUseSelect = useSelect as jest.MockedFunction< typeof useSelect >;
const mockTrackImageStudioToolClick = trackImageStudioToolClick as jest.MockedFunction<
	typeof trackImageStudioToolClick
>;

describe( 'Header', () => {
	const defaultProps = {
		mode: ImageStudioMode.Edit,
		onClose: jest.fn(),
		setActiveToolbarOption: jest.fn(),
		activeToolbarOption: null,
		config: {
			imageData: {
				filename: 'test-image.jpg',
			},
		},
	};

	const mockSetAnnotationMode = jest.fn();
	const mockAddNotice = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();

		mockUseDispatch.mockReturnValue( {
			setAnnotationMode: mockSetAnnotationMode,
			addNotice: mockAddNotice,
		} as any );

		mockUseSelect.mockImplementation( ( selector: any ) => {
			const result = selector( () => ( {
				getImageStudioAiProcessing: () => false,
				getHasUpdatedMetadata: () => false,
				getIsAnnotationMode: () => false,
				getDraftIds: () => [],
				getEntryPoint: () => ImageStudioEntryPoint.MediaLibrary,
			} ) );
			return result;
		} );
	} );

	describe( 'Rendering', () => {
		it( 'renders header with title in Generate mode', () => {
			render( <Header { ...defaultProps } mode={ ImageStudioMode.Generate } /> );

			expect( screen.getByText( 'Image Editor' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Beta' ) ).toBeInTheDocument();
		} );

		it( 'renders navigation pill in Edit mode with filename', () => {
			render( <Header { ...defaultProps } mode={ ImageStudioMode.Edit } /> );

			expect( screen.getByText( 'test-image.jpg' ) ).toBeInTheDocument();
		} );

		it( 'does not render navigation pill when filename is missing', () => {
			const propsWithoutFilename = {
				...defaultProps,
				config: {},
			};

			render( <Header { ...propsWithoutFilename } mode={ ImageStudioMode.Edit } /> );

			expect( screen.queryByText( 'test-image.jpg' ) ).not.toBeInTheDocument();
		} );

		it( 'renders toolbar in Edit mode', () => {
			render( <Header { ...defaultProps } mode={ ImageStudioMode.Edit } /> );

			expect( screen.getByLabelText( 'Select an area of the image to edit' ) ).toBeInTheDocument();
			expect(
				screen.getByLabelText( 'View or edit information about the image' )
			).toBeInTheDocument();
		} );

		it( 'does not render toolbar in Generate mode', () => {
			render( <Header { ...defaultProps } mode={ ImageStudioMode.Generate } /> );

			expect(
				screen.queryByLabelText( 'Select an area of the image to edit' )
			).not.toBeInTheDocument();
		} );

		it( 'renders close button', () => {
			render( <Header { ...defaultProps } /> );

			expect( screen.getByLabelText( 'Close image editor' ) ).toBeInTheDocument();
		} );

		it( 'renders custom left content when provided', () => {
			const customContent = <div>Custom Content</div>;
			render( <Header { ...defaultProps } leftContent={ customContent } /> );

			expect( screen.getByText( 'Custom Content' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Save Button', () => {
		it( 'renders save button with default text for Media Library entry point', () => {
			render( <Header { ...defaultProps } mode={ ImageStudioMode.Edit } /> );

			expect( screen.getByRole( 'button', { name: /Save/i } ) ).toHaveTextContent( 'Save' );
		} );

		it( 'renders save button with "Save & Apply" text for Editor entry points', () => {
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getImageStudioAiProcessing: () => false,
					getHasUpdatedMetadata: () => false,
					getIsAnnotationMode: () => false,
					getDraftIds: () => [],
					getEntryPoint: () => ImageStudioEntryPoint.EditorBlock,
				} ) );
				return result;
			} );

			render( <Header { ...defaultProps } mode={ ImageStudioMode.Edit } /> );

			expect( screen.getByRole( 'button', { name: /Save and apply/i } ) ).toHaveTextContent(
				'Save & Apply'
			);
		} );

		it( 'shows "Saving…" text when isSaving is true', () => {
			render( <Header { ...defaultProps } mode={ ImageStudioMode.Edit } isSaving /> );

			expect( screen.getByRole( 'button', { name: /Save/i } ) ).toHaveTextContent( 'Saving…' );
		} );

		it( 'disables save button when not saveable', () => {
			render( <Header { ...defaultProps } mode={ ImageStudioMode.Edit } isSaveable={ false } /> );

			expect( screen.getByRole( 'button', { name: /Save/i } ) ).toBeDisabled();
		} );

		it( 'disables save button when saving', () => {
			render( <Header { ...defaultProps } mode={ ImageStudioMode.Edit } isSaving /> );

			expect( screen.getByRole( 'button', { name: /Save/i } ) ).toBeDisabled();
		} );

		it( 'calls onSave when save button is clicked', async () => {
			const onSave = jest.fn();
			const user = userEvent.setup();

			render( <Header { ...defaultProps } mode={ ImageStudioMode.Edit } onSave={ onSave } /> );

			await user.click( screen.getByRole( 'button', { name: /Save displayed/i } ) );

			expect( onSave ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'Toolbar Interactions', () => {
		it( 'toggles Annotate toolbar option when Select button is clicked', async () => {
			const setActiveToolbarOption = jest.fn();
			const user = userEvent.setup();

			render(
				<Header
					{ ...defaultProps }
					mode={ ImageStudioMode.Edit }
					setActiveToolbarOption={ setActiveToolbarOption }
				/>
			);

			await user.click( screen.getByLabelText( 'Select an area of the image to edit' ) );

			expect( setActiveToolbarOption ).toHaveBeenCalledWith( ToolbarOption.Annotate );
			expect( mockSetAnnotationMode ).toHaveBeenCalledWith( true );
			expect( mockTrackImageStudioToolClick ).toHaveBeenCalledWith( 'annotate' );
		} );

		it( 'deactivates Annotate when clicked again', async () => {
			const setActiveToolbarOption = jest.fn();
			const user = userEvent.setup();

			render(
				<Header
					{ ...defaultProps }
					mode={ ImageStudioMode.Edit }
					activeToolbarOption={ ToolbarOption.Annotate }
					setActiveToolbarOption={ setActiveToolbarOption }
				/>
			);

			await user.click( screen.getByLabelText( 'Select an area of the image to edit' ) );

			expect( setActiveToolbarOption ).toHaveBeenCalledWith( null );
			expect( mockSetAnnotationMode ).toHaveBeenCalledWith( false );
		} );

		it( 'toggles AltText toolbar option when Image Info button is clicked', async () => {
			const setActiveToolbarOption = jest.fn();
			const user = userEvent.setup();

			render(
				<Header
					{ ...defaultProps }
					mode={ ImageStudioMode.Edit }
					setActiveToolbarOption={ setActiveToolbarOption }
				/>
			);

			await user.click( screen.getByLabelText( 'View or edit information about the image' ) );

			expect( setActiveToolbarOption ).toHaveBeenCalledWith( ToolbarOption.AltText );
			expect( mockSetAnnotationMode ).toHaveBeenCalledWith( false );
			expect( mockTrackImageStudioToolClick ).toHaveBeenCalledWith( 'alt_text', 'open' );
		} );

		it( 'tracks close event when AltText is toggled off', async () => {
			const setActiveToolbarOption = jest.fn();
			const user = userEvent.setup();

			render(
				<Header
					{ ...defaultProps }
					mode={ ImageStudioMode.Edit }
					activeToolbarOption={ ToolbarOption.AltText }
					setActiveToolbarOption={ setActiveToolbarOption }
				/>
			);

			await user.click( screen.getByLabelText( 'View or edit information about the image' ) );

			expect( mockTrackImageStudioToolClick ).toHaveBeenCalledWith( 'alt_text', 'close' );
		} );

		it( 'disables toolbar buttons when AI is processing', () => {
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getImageStudioAiProcessing: () => true,
					getHasUpdatedMetadata: () => false,
					getIsAnnotationMode: () => false,
					getDraftIds: () => [],
					getEntryPoint: () => ImageStudioEntryPoint.MediaLibrary,
				} ) );
				return result;
			} );

			render( <Header { ...defaultProps } mode={ ImageStudioMode.Edit } /> );

			expect( screen.getByLabelText( 'Select an area of the image to edit' ) ).toBeDisabled();
			expect( screen.getByLabelText( 'View or edit information about the image' ) ).toBeDisabled();
		} );

		it( 'shows pressed state for active toolbar option', () => {
			render(
				<Header
					{ ...defaultProps }
					mode={ ImageStudioMode.Edit }
					activeToolbarOption={ ToolbarOption.Annotate }
				/>
			);

			const annotateButton = screen.getByLabelText( 'Select an area of the image to edit' );
			expect( annotateButton ).toHaveAttribute( 'aria-pressed', 'true' );
		} );
	} );

	describe( 'Annotation Mode', () => {
		it( 'renders undo/redo buttons in annotation mode', () => {
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getImageStudioAiProcessing: () => false,
					getHasUpdatedMetadata: () => false,
					getIsAnnotationMode: () => true,
					getDraftIds: () => [],
					getEntryPoint: () => ImageStudioEntryPoint.MediaLibrary,
				} ) );
				return result;
			} );

			render( <Header { ...defaultProps } mode={ ImageStudioMode.Edit } /> );

			expect( screen.getByLabelText( /Undo/ ) ).toBeInTheDocument();
			expect( screen.getByLabelText( /Redo/ ) ).toBeInTheDocument();
		} );

		it( 'does not render undo/redo buttons when not in annotation mode', () => {
			render( <Header { ...defaultProps } mode={ ImageStudioMode.Edit } /> );

			expect( screen.queryByLabelText( /Undo/ ) ).not.toBeInTheDocument();
			expect( screen.queryByLabelText( /Redo/ ) ).not.toBeInTheDocument();
		} );

		it( 'calls onAnnotationUndo when undo button is clicked', async () => {
			const onAnnotationUndo = jest.fn();
			const user = userEvent.setup();

			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getImageStudioAiProcessing: () => false,
					getHasUpdatedMetadata: () => false,
					getIsAnnotationMode: () => true,
					getDraftIds: () => [],
					getEntryPoint: () => ImageStudioEntryPoint.MediaLibrary,
				} ) );
				return result;
			} );

			render(
				<Header
					{ ...defaultProps }
					mode={ ImageStudioMode.Edit }
					onAnnotationUndo={ onAnnotationUndo }
					hasPendingAnnotations
				/>
			);

			await user.click( screen.getByLabelText( /Undo/ ) );

			expect( onAnnotationUndo ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'disables undo button when no pending annotations', () => {
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getImageStudioAiProcessing: () => false,
					getHasUpdatedMetadata: () => false,
					getIsAnnotationMode: () => true,
					getDraftIds: () => [],
					getEntryPoint: () => ImageStudioEntryPoint.MediaLibrary,
				} ) );
				return result;
			} );

			render(
				<Header { ...defaultProps } mode={ ImageStudioMode.Edit } hasPendingAnnotations={ false } />
			);

			expect( screen.getByLabelText( /Undo/ ) ).toBeDisabled();
		} );

		it( 'calls onAnnotationRedo when redo button is clicked', async () => {
			const onAnnotationRedo = jest.fn();
			const user = userEvent.setup();

			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getImageStudioAiProcessing: () => false,
					getHasUpdatedMetadata: () => false,
					getIsAnnotationMode: () => true,
					getDraftIds: () => [],
					getEntryPoint: () => ImageStudioEntryPoint.MediaLibrary,
				} ) );
				return result;
			} );

			render(
				<Header
					{ ...defaultProps }
					mode={ ImageStudioMode.Edit }
					onAnnotationRedo={ onAnnotationRedo }
					hasUndoneAnnotations
				/>
			);

			await user.click( screen.getByLabelText( /Redo/ ) );

			expect( onAnnotationRedo ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'disables redo button when no undone annotations', () => {
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getImageStudioAiProcessing: () => false,
					getHasUpdatedMetadata: () => false,
					getIsAnnotationMode: () => true,
					getDraftIds: () => [],
					getEntryPoint: () => ImageStudioEntryPoint.MediaLibrary,
				} ) );
				return result;
			} );

			render(
				<Header { ...defaultProps } mode={ ImageStudioMode.Edit } hasUndoneAnnotations={ false } />
			);

			expect( screen.getByLabelText( /Redo/ ) ).toBeDisabled();
		} );
	} );

	describe( 'Navigation', () => {
		it( 'calls onNavigatePrevious when previous button is clicked', async () => {
			const onNavigatePrevious = jest.fn();
			const user = userEvent.setup();

			render(
				<Header
					{ ...defaultProps }
					mode={ ImageStudioMode.Edit }
					onNavigatePrevious={ onNavigatePrevious }
					hasPreviousImage
				/>
			);

			await user.click( screen.getByLabelText( /Previous image/ ) );

			expect( onNavigatePrevious ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'calls onNavigateNext when next button is clicked', async () => {
			const onNavigateNext = jest.fn();
			const user = userEvent.setup();

			render(
				<Header
					{ ...defaultProps }
					mode={ ImageStudioMode.Edit }
					onNavigateNext={ onNavigateNext }
					hasNextImage
				/>
			);

			await user.click( screen.getByLabelText( /Next image/ ) );

			expect( onNavigateNext ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'disables previous button when no previous image', () => {
			render(
				<Header { ...defaultProps } mode={ ImageStudioMode.Edit } hasPreviousImage={ false } />
			);

			expect( screen.getByLabelText( /Previous image/ ) ).toBeDisabled();
		} );

		it( 'disables next button when no next image', () => {
			render( <Header { ...defaultProps } mode={ ImageStudioMode.Edit } hasNextImage={ false } /> );

			expect( screen.getByLabelText( /Next image/ ) ).toBeDisabled();
		} );

		it( 'disables navigation when saving', () => {
			render(
				<Header
					{ ...defaultProps }
					mode={ ImageStudioMode.Edit }
					isSaving
					hasPreviousImage
					hasNextImage
				/>
			);

			expect( screen.getByLabelText( /Previous image/ ) ).toBeDisabled();
			expect( screen.getByLabelText( /Next image/ ) ).toBeDisabled();
		} );

		it( 'disables navigation when there are drafts', () => {
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getImageStudioAiProcessing: () => false,
					getHasUpdatedMetadata: () => false,
					getIsAnnotationMode: () => false,
					getDraftIds: () => [ '123' ],
					getEntryPoint: () => ImageStudioEntryPoint.MediaLibrary,
				} ) );
				return result;
			} );

			render(
				<Header { ...defaultProps } mode={ ImageStudioMode.Edit } hasPreviousImage hasNextImage />
			);

			// When there are drafts, the nav button labels change to a tooltip message
			const navButtons = screen.getAllByLabelText( /Save or discard your changes/ );
			expect( navButtons ).toHaveLength( 2 );
			navButtons.forEach( ( button ) => {
				expect( button ).toBeDisabled();
			} );
		} );

		it( 'disables navigation when AI is processing', () => {
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getImageStudioAiProcessing: () => true,
					getHasUpdatedMetadata: () => false,
					getIsAnnotationMode: () => false,
					getDraftIds: () => [],
					getEntryPoint: () => ImageStudioEntryPoint.MediaLibrary,
				} ) );
				return result;
			} );

			render(
				<Header { ...defaultProps } mode={ ImageStudioMode.Edit } hasPreviousImage hasNextImage />
			);

			expect( screen.getByLabelText( /Previous image/ ) ).toBeDisabled();
			expect( screen.getByLabelText( /Next image/ ) ).toBeDisabled();
		} );
	} );

	describe( 'Classic Media Editor', () => {
		it( 'renders Media Library button when classic editor URL is provided', () => {
			const propsWithAttachmentId = {
				...defaultProps,
				config: {
					...defaultProps.config,
					attachmentId: 123,
				},
				onClassicMediaEditorNavigation: jest.fn(),
			};

			render( <Header { ...propsWithAttachmentId } mode={ ImageStudioMode.Edit } /> );

			expect(
				screen.getByLabelText( 'Edit this image in the WordPress Media Library' )
			).toBeInTheDocument();
		} );

		it( 'does not render Media Library button without attachment ID', () => {
			const propsWithoutAttachmentId = {
				...defaultProps,
				onClassicMediaEditorNavigation: jest.fn(),
			};

			render( <Header { ...propsWithoutAttachmentId } mode={ ImageStudioMode.Edit } /> );

			expect(
				screen.queryByLabelText( 'Edit this image in the WordPress Media Library' )
			).not.toBeInTheDocument();
		} );

		it( 'calls onClassicMediaEditorNavigation when Media Library button is clicked', async () => {
			const onClassicMediaEditorNavigation = jest.fn().mockResolvedValue( undefined );
			const user = userEvent.setup();

			const propsWithAttachmentId = {
				...defaultProps,
				config: {
					...defaultProps.config,
					attachmentId: 123,
				},
				onClassicMediaEditorNavigation,
			};

			render( <Header { ...propsWithAttachmentId } mode={ ImageStudioMode.Edit } /> );

			await user.click( screen.getByLabelText( 'Edit this image in the WordPress Media Library' ) );

			expect( onClassicMediaEditorNavigation ).toHaveBeenCalledWith(
				'post.php?post=123&action=edit'
			);
			expect( mockTrackImageStudioToolClick ).toHaveBeenCalledWith( 'media_library' );
		} );

		it( 'shows error notice when navigation fails', async () => {
			const error = new Error( 'Navigation failed' );
			const onClassicMediaEditorNavigation = jest.fn().mockRejectedValue( error );
			const user = userEvent.setup();

			const propsWithAttachmentId = {
				...defaultProps,
				config: {
					...defaultProps.config,
					attachmentId: 123,
				},
				onClassicMediaEditorNavigation,
			};

			render( <Header { ...propsWithAttachmentId } mode={ ImageStudioMode.Edit } /> );

			await user.click( screen.getByLabelText( 'Edit this image in the WordPress Media Library' ) );

			await waitFor( () => {
				expect( mockAddNotice ).toHaveBeenCalledWith(
					'Failed to save changes. Please try again or use the Save button.',
					'error'
				);
			} );
		} );
	} );

	describe( 'Close Button', () => {
		it( 'calls onClose when close button is clicked', async () => {
			const onClose = jest.fn();
			const user = userEvent.setup();

			render( <Header { ...defaultProps } onClose={ onClose } /> );

			await user.click( screen.getByLabelText( 'Close image editor' ) );

			expect( onClose ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'disables close button when saving', () => {
			render( <Header { ...defaultProps } isSaving /> );

			expect( screen.getByLabelText( 'Close image editor' ) ).toBeDisabled();
		} );
	} );

	describe( 'Metadata Updates', () => {
		it( 'shows special styling for AltText button when metadata is updated', () => {
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getImageStudioAiProcessing: () => false,
					getHasUpdatedMetadata: () => true,
					getIsAnnotationMode: () => false,
					getDraftIds: () => [],
					getEntryPoint: () => ImageStudioEntryPoint.MediaLibrary,
				} ) );
				return result;
			} );

			render( <Header { ...defaultProps } mode={ ImageStudioMode.Edit } /> );

			const altTextButton = screen.getByLabelText( 'View or edit information about the image' );
			expect( altTextButton ).toHaveClass( 'image-studio-toolbar-alt-button' );
		} );
	} );
} );
