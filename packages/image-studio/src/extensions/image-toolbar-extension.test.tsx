/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
// eslint-disable-next-line import/order
import React from 'react';

// Webpack global injected at build time, used at render time by __().
( globalThis as Record< string, unknown > ).__i18n_text_domain__ = 'default';

const BASE_URL = 'https://example.com/wp-content/uploads/2024/01/photo.jpg';

// Mock media records
const makeAttachment = ( overrides = {} ) => ( {
	source_url: BASE_URL,
	mime_type: 'image/jpeg',
	media_details: {
		sizes: {
			thumbnail: { source_url: BASE_URL.replace( '.jpg', '-150x150.jpg' ) },
			medium: { source_url: BASE_URL.replace( '.jpg', '-300x200.jpg' ) },
			large: { source_url: BASE_URL.replace( '.jpg', '-1024x768.jpg' ) },
			custom: { source_url: BASE_URL.replace( '.jpg', '-500x500.jpg?ver=123' ) },
		},
	},
	...overrides,
} );

const STALE_ATTACHMENT = {
	source_url: 'https://example.com/wp-content/uploads/2024/01/other.jpg',
	media_details: {
		sizes: {
			thumbnail: {
				source_url: 'https://example.com/wp-content/uploads/2024/01/other-150x150.jpg',
			},
		},
	},
};

jest.mock( '@wordpress/core-data', () => ( {
	store: 'core',
} ) );

const mockOpenImageStudio = jest.fn();
const mockCreateNotice = jest.fn();
const mockResolveEntityRecord = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	dispatch: jest.fn( () => ( { openImageStudio: mockOpenImageStudio } ) ),
	resolveSelect: jest.fn( () => ( { getEntityRecord: mockResolveEntityRecord } ) ),
	useDispatch: jest.fn( ( store: string ) =>
		store === 'core/notices' ? { createNotice: mockCreateNotice } : {}
	),
	useSelect: jest.fn(),
} ) );

jest.mock( '@wordpress/block-editor', () => ( {
	store: 'core/block-editor',
	BlockControls: ( { children }: { children: React.ReactNode } ) => (
		<div data-testid="block-controls">{ children }</div>
	),
} ) );

jest.mock( '@wordpress/components', () => ( {
	ToolbarButton: ( {
		children,
		label,
		onClick,
		isBusy,
		disabled,
	}: {
		children: React.ReactNode;
		label: string;
		onClick: () => void;
		isBusy?: boolean;
		disabled?: boolean;
	} ) => (
		// ToolbarButton keeps a disabled button focusable, exposing it as aria-disabled.
		<button
			data-testid="toolbar-button"
			aria-label={ label }
			data-busy={ String( !! isBusy ) }
			aria-disabled={ String( !! disabled ) }
			onClick={ onClick }
		>
			{ children }
		</button>
	),
	ToolbarGroup: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );

jest.mock( '@wordpress/compose', () => ( {
	createHigherOrderComponent: ( fn: ( component: React.ComponentType ) => React.ComponentType ) =>
		fn,
} ) );

jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

jest.mock( '../store/index', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: { EditorBlock: 'editor-block' },
} ) );

jest.mock( '../types', () => ( {
	IMAGE_STUDIO_SUPPORTED_MIME_TYPES: [ 'image/jpeg', 'image/png', 'image/webp' ],
	ImageStudioMode: { Edit: 'edit' },
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioOpened: jest.fn(),
} ) );

jest.mock( '../utils/get-image-data', () => ( {} ) );

// Must import after jest.mock() calls to receive the mocked dependencies.
import { trackImageStudioOpened } from '../utils/tracking';
import { withImageStudioToolbarButton } from './image-toolbar-extension';

const BlockEdit = () => <div data-testid="block-edit" />;
const ToolbarBlockEdit = withImageStudioToolbarButton( BlockEdit );

function renderToolbar( {
	attachment = makeAttachment(),
	hasResolved = true,
	attributes = { id: 1, url: BASE_URL },
	name = 'core/image',
	settings = { mediaUpload: jest.fn() },
	isSelected = true,
}: {
	attachment?: ReturnType< typeof makeAttachment > | null;
	hasResolved?: boolean;
	attributes?: { id?: number; url?: string };
	name?: string;
	settings?: { mediaUpload?: unknown };
	isSelected?: boolean;
} = {} ) {
	const getEntityRecord = jest.fn( () => attachment );
	( useSelect as jest.Mock ).mockImplementation(
		( callback: ( select: () => Record< string, jest.Mock > ) => unknown ) =>
			callback( () => ( {
				getSettings: jest.fn( () => settings ),
				getEntityRecord,
				hasFinishedResolution: jest.fn( () => hasResolved ),
			} ) )
	);

	const block = ( selected: boolean, blockAttributes = attributes ) => (
		<ToolbarBlockEdit
			name={ name }
			attributes={ blockAttributes }
			isSelected={ selected }
			setAttributes={ jest.fn() }
		/>
	);
	const view = render( block( isSelected ) );

	return {
		...view,
		getEntityRecord,
		setSelected: ( selected: boolean ) => view.rerender( block( selected ) ),
		setBlockAttributes: ( blockAttributes: { id?: number; url?: string } ) =>
			view.rerender( block( isSelected, blockAttributes ) ),
	};
}

describe( 'withImageStudioToolbarButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it.each( [ false, undefined ] )( 'hides the button when mediaUpload is %s', ( mediaUpload ) => {
		renderToolbar( { settings: { mediaUpload } } );

		expect( screen.getByTestId( 'block-edit' ) ).toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Edit image with AI' } )
		).not.toBeInTheDocument();
	} );

	it( 'updates the button when upload permission changes', () => {
		const settings: { mediaUpload?: unknown } = {};
		const { rerender } = renderToolbar( { settings } );
		const block = () => (
			<ToolbarBlockEdit
				name="core/image"
				attributes={ { id: 1, url: BASE_URL } }
				isSelected
				setAttributes={ jest.fn() }
			/>
		);
		expect(
			screen.queryByRole( 'button', { name: 'Edit image with AI' } )
		).not.toBeInTheDocument();

		settings.mediaUpload = jest.fn();
		rerender( block() );
		expect( screen.getByRole( 'button', { name: 'Edit image with AI' } ) ).toBeInTheDocument();

		settings.mediaUpload = false;
		rerender( block() );
		expect(
			screen.queryByRole( 'button', { name: 'Edit image with AI' } )
		).not.toBeInTheDocument();
		expect( screen.getByTestId( 'block-edit' ) ).toBeInTheDocument();
	} );

	it( 'should return a component compatible with class extends', () => {
		const Wrapped = withImageStudioToolbarButton( BlockEdit );

		// This must not throw — plugins like AMP use `class extends`
		// on editor filter results.
		expect( () => {
			class TestExtend extends ( Wrapped as any ) {}
			return TestExtend;
		} ).not.toThrow();
	} );

	it( 'should always render BlockEdit regardless of button visibility', () => {
		renderToolbar( { name: 'core/paragraph' } );
		expect( screen.getByTestId( 'block-edit' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'toolbar-button' ) ).not.toBeInTheDocument();
	} );

	describe( 'URL matching', () => {
		it( 'should show button for a matching full-size URL', () => {
			renderToolbar();
			expect( screen.getByTestId( 'toolbar-button' ) ).toBeInTheDocument();
		} );

		it( 'should show button for an intermediate size URL', () => {
			renderToolbar( {
				attributes: { id: 1, url: BASE_URL.replace( '.jpg', '-1024x768.jpg' ) },
			} );
			expect( screen.getByTestId( 'toolbar-button' ) ).toBeInTheDocument();
		} );

		it( 'should show button when attributes URL has query params', () => {
			renderToolbar( {
				attributes: { id: 1, url: BASE_URL + '?w=300&quality=80' },
			} );
			expect( screen.getByTestId( 'toolbar-button' ) ).toBeInTheDocument();
		} );

		it( 'should show button when source_url has query params', () => {
			renderToolbar( {
				attachment: makeAttachment( { source_url: BASE_URL + '?ver=123' } ),
			} );
			expect( screen.getByTestId( 'toolbar-button' ) ).toBeInTheDocument();
		} );

		it( 'should show button when size URL has query params', () => {
			// The custom size has a unique base path (-500x500) with query params.
			// This only matches if params are stripped from the size URL.
			renderToolbar( {
				attributes: { id: 1, url: BASE_URL.replace( '.jpg', '-500x500.jpg' ) },
			} );
			expect( screen.getByTestId( 'toolbar-button' ) ).toBeInTheDocument();
		} );

		it( 'should hide button when URL does not match any known size', () => {
			renderToolbar( {
				attributes: { id: 1, url: 'https://other-site.com/different-image.jpg' },
			} );
			expect( screen.getByTestId( 'block-edit' ) ).toBeInTheDocument();
			expect( screen.queryByTestId( 'toolbar-button' ) ).not.toBeInTheDocument();
		} );

		it( 'should hide button for a stale attachment ID', () => {
			renderToolbar( {
				attachment: makeAttachment( STALE_ATTACHMENT ),
				attributes: { id: 1, url: BASE_URL },
			} );
			expect( screen.getByTestId( 'block-edit' ) ).toBeInTheDocument();
			expect( screen.queryByTestId( 'toolbar-button' ) ).not.toBeInTheDocument();
		} );

		it( 'should show button when attachment has no media_details', () => {
			renderToolbar( {
				attachment: makeAttachment( { media_details: undefined } ),
				attributes: { id: 1, url: BASE_URL },
			} );
			expect( screen.getByTestId( 'toolbar-button' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'resolution state', () => {
		it( 'should show button while resolution is pending', () => {
			renderToolbar( {
				hasResolved: false,
				attachment: null,
				attributes: { id: 1, url: BASE_URL },
			} );
			expect( screen.getByTestId( 'toolbar-button' ) ).toBeInTheDocument();
		} );

		it( 'should hide button for a stale attachment already cached while resolution is pending', () => {
			renderToolbar( { hasResolved: false, attachment: makeAttachment( STALE_ATTACHMENT ) } );
			expect( screen.getByTestId( 'block-edit' ) ).toBeInTheDocument();
			expect( screen.queryByTestId( 'toolbar-button' ) ).not.toBeInTheDocument();
		} );

		it.each( [
			[ 'a url', BASE_URL ],
			[ 'no url', undefined ],
		] )(
			'should hide button when attachment is null after resolution for a block with %s',
			( _, url ) => {
				renderToolbar( { attachment: null, attributes: { id: 1, url } } );
				expect( screen.getByTestId( 'block-edit' ) ).toBeInTheDocument();
				expect( screen.queryByTestId( 'toolbar-button' ) ).not.toBeInTheDocument();
			}
		);
	} );

	describe( 'attachment read', () => {
		it.each( [ 'core/cover', 'core/video', 'core/file', 'core/media-text' ] )(
			'does not read the attachment for %s blocks',
			( name ) => {
				const { getEntityRecord } = renderToolbar( { name, attributes: { id: 1 } } );
				expect( getEntityRecord ).not.toHaveBeenCalled();
				expect( screen.queryByTestId( 'toolbar-button' ) ).not.toBeInTheDocument();
			}
		);

		it.each( [
			[ 'a url', BASE_URL ],
			[ 'no url', undefined ],
		] )( 'does not read the attachment for an unselected image block with %s', ( _, url ) => {
			const { getEntityRecord } = renderToolbar( {
				isSelected: false,
				attributes: { id: 1, url },
			} );
			expect( getEntityRecord ).not.toHaveBeenCalled();
			expect( screen.getByTestId( 'block-edit' ) ).toBeInTheDocument();
			expect( screen.queryByTestId( 'toolbar-button' ) ).not.toBeInTheDocument();
		} );

		it( 'reads the attachment for a selected image block', () => {
			const { getEntityRecord } = renderToolbar();
			expect( getEntityRecord ).toHaveBeenCalledWith( 'postType', 'attachment', 1 );
			expect( screen.getByTestId( 'toolbar-button' ) ).toBeInTheDocument();
		} );

		it( 'starts the read when the image block becomes selected', () => {
			const { getEntityRecord, setSelected } = renderToolbar( { isSelected: false } );
			expect( getEntityRecord ).not.toHaveBeenCalled();
			setSelected( true );
			expect( getEntityRecord ).toHaveBeenCalledWith( 'postType', 'attachment', 1 );
			expect( screen.getByTestId( 'toolbar-button' ) ).toBeInTheDocument();
		} );

		it( 'hides the button without a new read when the image block is deselected', () => {
			const { getEntityRecord, setSelected } = renderToolbar();
			const readsWhileSelected = getEntityRecord.mock.calls.length;
			setSelected( false );
			expect( getEntityRecord ).toHaveBeenCalledTimes( readsWhileSelected );
			expect( screen.queryByTestId( 'toolbar-button' ) ).not.toBeInTheDocument();
		} );

		it( 'shows the button on first selection while the read is pending', () => {
			const { setSelected } = renderToolbar( {
				isSelected: false,
				hasResolved: false,
				attachment: null,
			} );
			setSelected( true );
			expect( screen.getByTestId( 'toolbar-button' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'opening Image Studio', () => {
		const clickEdit = () =>
			fireEvent.click( screen.getByRole( 'button', { name: 'Edit image with AI' } ) );

		it( 'opens straight away when the read has resolved', () => {
			renderToolbar();
			clickEdit();
			expect( mockResolveEntityRecord ).not.toHaveBeenCalled();
			expect( mockOpenImageStudio ).toHaveBeenCalledWith(
				1,
				expect.any( Function ),
				'editor-block',
				'core/image'
			);
			expect( trackImageStudioOpened ).toHaveBeenCalledTimes( 1 );
			expect( mockCreateNotice ).not.toHaveBeenCalled();
		} );

		it( 'opens once the pending read confirms the attachment', async () => {
			mockResolveEntityRecord.mockResolvedValue( makeAttachment() );
			renderToolbar( { hasResolved: false, attachment: null } );
			clickEdit();
			expect( mockOpenImageStudio ).not.toHaveBeenCalled();
			await waitFor( () => expect( mockOpenImageStudio ).toHaveBeenCalled() );
			expect( mockResolveEntityRecord ).toHaveBeenCalledWith( 'postType', 'attachment', 1 );
			expect( trackImageStudioOpened ).toHaveBeenCalledTimes( 1 );
			expect( mockCreateNotice ).not.toHaveBeenCalled();
		} );

		it( 'marks the button busy and ignores clicks until the pending read finishes', async () => {
			let finishRead: ( record: unknown ) => void = () => {};
			mockResolveEntityRecord.mockReturnValue(
				new Promise( ( resolve ) => ( finishRead = resolve ) )
			);
			renderToolbar( { hasResolved: false, attachment: null } );
			clickEdit();
			clickEdit();
			const button = screen.getByTestId( 'toolbar-button' );
			expect( button ).toHaveAttribute( 'data-busy', 'true' );
			expect( button ).toHaveAttribute( 'aria-disabled', 'true' );

			await act( async () => finishRead( makeAttachment() ) );
			expect( button ).toHaveAttribute( 'data-busy', 'false' );
			expect( button ).toHaveAttribute( 'aria-disabled', 'false' );
			expect( mockResolveEntityRecord ).toHaveBeenCalledTimes( 1 );
			expect( mockOpenImageStudio ).toHaveBeenCalledTimes( 1 );
		} );

		it.each( [
			[
				'its image is replaced',
				( view: ReturnType< typeof renderToolbar > ) =>
					view.setBlockAttributes( { id: 2, url: BASE_URL } ),
			],
			[
				'it is deselected',
				( view: ReturnType< typeof renderToolbar > ) => view.setSelected( false ),
			],
			[ 'it is removed', ( view: ReturnType< typeof renderToolbar > ) => view.unmount() ],
		] )(
			'does nothing when the block changes because %s while the read is pending',
			async ( _, change ) => {
				let finishRead: ( record: unknown ) => void = () => {};
				mockResolveEntityRecord.mockReturnValue(
					new Promise( ( resolve ) => ( finishRead = resolve ) )
				);
				const view = renderToolbar( { hasResolved: false, attachment: null } );
				clickEdit();
				change( view );

				await act( async () => finishRead( makeAttachment() ) );
				expect( mockOpenImageStudio ).not.toHaveBeenCalled();
				expect( mockCreateNotice ).not.toHaveBeenCalled();
			}
		);

		it.each( [
			[ 'another site', 'https://other-site.com/different-image.jpg', 0, 1 ],
			[ 'another size of the same image', BASE_URL.replace( '.jpg', '-1024x768.jpg' ), 1, 0 ],
		] )(
			'checks the latest block url when it changes to %s while the read is pending',
			async ( _, url, opens, notices ) => {
				let finishRead: ( record: unknown ) => void = () => {};
				mockResolveEntityRecord.mockReturnValue(
					new Promise( ( resolve ) => ( finishRead = resolve ) )
				);
				const view = renderToolbar( { hasResolved: false, attachment: null } );
				clickEdit();
				view.setBlockAttributes( { id: 1, url } );

				await act( async () => finishRead( makeAttachment() ) );
				expect( mockOpenImageStudio ).toHaveBeenCalledTimes( opens );
				expect( mockCreateNotice ).toHaveBeenCalledTimes( notices );
			}
		);

		it( 'logs the error when the pending read fails', async () => {
			const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
			try {
				const error = new Error( 'Not found' );
				mockResolveEntityRecord.mockRejectedValue( error );
				renderToolbar( { hasResolved: false, attachment: null } );
				clickEdit();

				await waitFor( () =>
					expect( consoleErrorSpy ).toHaveBeenCalledWith(
						'[Image Studio] Failed to load attachment 1:',
						error
					)
				);
			} finally {
				consoleErrorSpy.mockRestore();
			}
		} );

		it.each( [
			[
				'a stale attachment',
				() => Promise.resolve( makeAttachment( STALE_ATTACHMENT ) ),
				BASE_URL,
			],
			[
				'an unsupported MIME type',
				() => Promise.resolve( makeAttachment( { mime_type: 'image/svg+xml' } ) ),
				BASE_URL,
			],
			[ 'no attachment', () => Promise.resolve( null ), BASE_URL ],
			[ 'an error', () => Promise.reject( new Error( 'Not found' ) ), BASE_URL ],
			[
				'an error for a block without a url',
				() => Promise.reject( new Error( 'Not found' ) ),
				undefined,
			],
		] )(
			'shows a snackbar instead of opening when the pending read returns %s',
			async ( _, read, url ) => {
				mockResolveEntityRecord.mockImplementation( read );
				renderToolbar( { hasResolved: false, attachment: null, attributes: { id: 1, url } } );
				clickEdit();
				await waitFor( () =>
					expect( screen.getByTestId( 'toolbar-button' ) ).toHaveAttribute( 'data-busy', 'false' )
				);
				expect( mockOpenImageStudio ).not.toHaveBeenCalled();
				expect( trackImageStudioOpened ).not.toHaveBeenCalled();
				expect( mockCreateNotice ).toHaveBeenCalledTimes( 1 );
				expect( mockCreateNotice ).toHaveBeenCalledWith(
					'error',
					"This image can't be edited with AI. Replace it with another image from your Media Library.",
					{ type: 'snackbar', isDismissible: true }
				);
			}
		);
	} );

	describe( 'guard conditions', () => {
		it( 'should hide button for non-image blocks', () => {
			renderToolbar( { name: 'core/paragraph' } );
			expect( screen.getByTestId( 'block-edit' ) ).toBeInTheDocument();
			expect( screen.queryByTestId( 'toolbar-button' ) ).not.toBeInTheDocument();
		} );

		it( 'should hide button when there is no attachment ID', () => {
			renderToolbar( { attributes: { id: undefined, url: BASE_URL } } );
			expect( screen.getByTestId( 'block-edit' ) ).toBeInTheDocument();
			expect( screen.queryByTestId( 'toolbar-button' ) ).not.toBeInTheDocument();
		} );

		it( 'should show button when attributes URL is undefined', () => {
			// No URL means no mismatch can be detected, so the button shows.
			renderToolbar( { attributes: { id: 1, url: undefined } } );
			expect( screen.getByTestId( 'toolbar-button' ) ).toBeInTheDocument();
		} );

		it( 'should hide button for unsupported MIME types', () => {
			renderToolbar( {
				attachment: makeAttachment( { mime_type: 'image/svg+xml' } ),
			} );
			expect( screen.getByTestId( 'block-edit' ) ).toBeInTheDocument();
			expect( screen.queryByTestId( 'toolbar-button' ) ).not.toBeInTheDocument();
		} );
	} );
} );
