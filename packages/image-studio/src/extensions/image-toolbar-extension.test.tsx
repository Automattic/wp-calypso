/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
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

jest.mock( '@wordpress/core-data', () => ( {
	store: 'core',
} ) );

jest.mock( '@wordpress/data', () => ( {
	dispatch: jest.fn( () => ( { openImageStudio: jest.fn() } ) ),
	useSelect: jest.fn(),
} ) );

jest.mock( '@wordpress/block-editor', () => ( {
	BlockControls: ( { children }: { children: React.ReactNode } ) => (
		<div data-testid="block-controls">{ children }</div>
	),
} ) );

jest.mock( '@wordpress/components', () => ( {
	ToolbarButton: ( { children, label }: { children: React.ReactNode; label: string } ) => (
		<button data-testid="toolbar-button" aria-label={ label }>
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
import { withImageStudioToolbarButton } from './image-toolbar-extension';

const BlockEdit = () => <div data-testid="block-edit" />;

function renderToolbar( {
	attachment = makeAttachment(),
	hasResolved = true,
	attributes = { id: 1, url: BASE_URL },
	name = 'core/image',
}: {
	attachment?: ReturnType< typeof makeAttachment > | null;
	hasResolved?: boolean;
	attributes?: { id?: number; url?: string };
	name?: string;
} = {} ) {
	( useSelect as jest.Mock ).mockImplementation(
		( callback: ( select: () => Record< string, jest.Mock > ) => unknown ) =>
			callback( () => ( {
				getEntityRecord: jest.fn( () => attachment ),
				hasFinishedResolution: jest.fn( () => hasResolved ),
			} ) )
	);

	const Component = withImageStudioToolbarButton( BlockEdit );
	return render(
		<Component name={ name } attributes={ attributes } setAttributes={ jest.fn() } />
	);
}

describe( 'withImageStudioToolbarButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
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
				attachment: makeAttachment( {
					source_url: 'https://example.com/wp-content/uploads/2024/01/other.jpg',
					media_details: {
						sizes: {
							thumbnail: {
								source_url: 'https://example.com/wp-content/uploads/2024/01/other-150x150.jpg',
							},
						},
					},
				} ),
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

		it( 'should hide button when attachment is null after resolution', () => {
			renderToolbar( { attachment: null, attributes: { id: 1, url: BASE_URL } } );
			expect( screen.getByTestId( 'block-edit' ) ).toBeInTheDocument();
			expect( screen.queryByTestId( 'toolbar-button' ) ).not.toBeInTheDocument();
		} );
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
