const mockGetRenderingMode = jest.fn();

jest.mock( '@wordpress/blocks', () => ( { serialize: jest.fn() } ) );
jest.mock( '@wordpress/data', () => ( {
	select: () => ( { getRenderingMode: mockGetRenderingMode } ),
} ) );
jest.mock( '../editor-blocks', () => ( {
	DOCUMENT_ROOT_CLIENT_ID: '__agents-manager-document-root__',
	findPostContentClientId: jest.fn(),
	getCurrentPost: jest.fn(),
	getRootBlocks: jest.fn(),
} ) );
jest.mock( '../is-editor-page', () => ( { isEditorPage: jest.fn() } ) );
jest.mock( '../site-editor-context', () => ( { isSiteEditorContext: jest.fn() } ) );

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
	jest.resetAllMocks();
	jest.mocked( serialize ).mockReturnValue( '<!-- wp:paragraph /-->' );
	jest.mocked( getRootBlocks ).mockReturnValue( body );
	jest.mocked( getCurrentPost ).mockReturnValue( { id: 211, type: 'page' } );
	jest.mocked( isEditorPage ).mockReturnValue( true );
	jest.mocked( isSiteEditorContext ).mockReturnValue( false );
	mockGetRenderingMode.mockReturnValue( 'post-only' );
} );

it( 'prefers post-content inside a site-editor template', () => {
	jest.mocked( isSiteEditorContext ).mockReturnValue( true );
	mockGetRenderingMode.mockReturnValue( 'template-locked' );
	jest.mocked( findPostContentClientId ).mockReturnValue( 'pc' );

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
	jest.mocked( isSiteEditorContext ).mockReturnValue( true );

	expect( getPageContentMarkup() ).toBe( '' );
	expect( getRootBlocks ).not.toHaveBeenCalled();
} );

it( 'excludes document roots outside an editor', () => {
	jest.mocked( isEditorPage ).mockReturnValue( false );

	expect( getPageContentMarkup() ).toBe( '' );
	expect( getRootBlocks ).not.toHaveBeenCalled();
} );

it( 'excludes non-page document roots', () => {
	jest.mocked( getCurrentPost ).mockReturnValue( { id: 211, type: 'post' } );

	expect( getPageContentMarkup() ).toBe( '' );
	expect( getRootBlocks ).not.toHaveBeenCalled();
} );

it( 'excludes the page editor template root', () => {
	mockGetRenderingMode.mockReturnValue( 'template-locked' );

	expect( getPageContentMarkup() ).toBe( '' );
	expect( getRootBlocks ).not.toHaveBeenCalled();
} );
