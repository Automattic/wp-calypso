/* eslint-disable import/order */
import { vi } from 'vitest';
const mockGetRenderingMode = vi.fn();

vi.mock( '@wordpress/blocks', () => ( { serialize: vi.fn() } ) );
vi.mock( '@wordpress/data', () => ( {
	select: () => ( { getRenderingMode: mockGetRenderingMode } ),
} ) );
vi.mock( '../editor-blocks', () => ( {
	DOCUMENT_ROOT_CLIENT_ID: '__agents-manager-document-root__',
	findPostContentClientId: vi.fn(),
	getCurrentPost: vi.fn(),
	getRootBlocks: vi.fn(),
} ) );
vi.mock( '../is-editor-page', () => ( { isEditorPage: vi.fn() } ) );
vi.mock( '../site-editor-context', () => ( { isSiteEditorContext: vi.fn() } ) );

import { serialize } from '@wordpress/blocks';
import {
	DOCUMENT_ROOT_CLIENT_ID,
	findPostContentClientId,
	getCurrentPost,
	getRootBlocks,
} from '../editor-blocks';
import { isEditorPage } from '../is-editor-page';
import { getPageContentMarkup } from '../page-content-markup';
import { isSiteEditorContext } from '../site-editor-context';

const body = [
	{ clientId: 'heading', name: 'core/heading', attributes: {}, innerBlocks: [] },
	{ clientId: 'paragraph', name: 'core/paragraph', attributes: {}, innerBlocks: [] },
];

beforeEach( () => {
	vi.resetAllMocks();
	vi.mocked( serialize ).mockReturnValue( '<!-- wp:paragraph /-->' );
	vi.mocked( getRootBlocks ).mockReturnValue( body );
	vi.mocked( getCurrentPost ).mockReturnValue( { id: 211, type: 'page' } );
	vi.mocked( isEditorPage ).mockReturnValue( true );
	vi.mocked( isSiteEditorContext ).mockReturnValue( false );
	mockGetRenderingMode.mockReturnValue( 'post-only' );
} );

it( 'prefers post-content inside a site-editor template', () => {
	vi.mocked( isSiteEditorContext ).mockReturnValue( true );
	mockGetRenderingMode.mockReturnValue( 'template-locked' );
	vi.mocked( findPostContentClientId ).mockReturnValue( 'pc' );

	expect( getPageContentMarkup() ).toBe( '<!-- wp:paragraph /-->' );
	expect( getRootBlocks ).toHaveBeenCalledTimes( 1 );
	expect( getRootBlocks ).toHaveBeenCalledWith( 'pc' );
	expect( serialize ).toHaveBeenCalledWith( body );
} );

it( 'serializes the live document root in the ordinary page editor', () => {
	expect( getPageContentMarkup() ).toBe( '<!-- wp:paragraph /-->' );
	expect( getRootBlocks ).toHaveBeenCalledWith( DOCUMENT_ROOT_CLIENT_ID );
	expect( serialize ).toHaveBeenCalledWith( body );
} );

it( 'excludes the site editor document root', () => {
	vi.mocked( isSiteEditorContext ).mockReturnValue( true );

	expect( getPageContentMarkup() ).toBe( '' );
	expect( getRootBlocks ).not.toHaveBeenCalled();
} );

it( 'excludes document roots outside an editor', () => {
	vi.mocked( isEditorPage ).mockReturnValue( false );

	expect( getPageContentMarkup() ).toBe( '' );
	expect( getRootBlocks ).not.toHaveBeenCalled();
} );

it( 'excludes non-page document roots', () => {
	vi.mocked( getCurrentPost ).mockReturnValue( { id: 211, type: 'post' } );

	expect( getPageContentMarkup() ).toBe( '' );
	expect( getRootBlocks ).not.toHaveBeenCalled();
} );

it( 'excludes the page editor template root', () => {
	mockGetRenderingMode.mockReturnValue( 'template-locked' );

	expect( getPageContentMarkup() ).toBe( '' );
	expect( getRootBlocks ).not.toHaveBeenCalled();
} );
