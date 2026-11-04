import { renderHook } from '@testing-library/react';
import { useAttachToEditorPost } from './use-attach-to-editor-post';

const mockSaveEntityRecord = jest.fn();
const mockGetEntityRecord = jest.fn();
const mockTrackImageStudioError = jest.fn();
let mockEditorStore: { getCurrentPost: () => unknown } | undefined;

jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn( () => ( { saveEntityRecord: mockSaveEntityRecord } ) ),
	select: jest.fn( ( storeName: string ) =>
		storeName === 'core/editor' ? mockEditorStore : undefined
	),
	resolveSelect: jest.fn( () => ( { getEntityRecord: mockGetEntityRecord } ) ),
} ) );

jest.mock( '@wordpress/core-data', () => ( {
	store: 'core',
} ) );

jest.mock( '../store', () => ( {
	store: 'image-studio',
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioError: ( ...args: unknown[] ) => mockTrackImageStudioError( ...args ),
} ) );

function editorShowing( post: unknown ) {
	return { getCurrentPost: () => post };
}

describe( 'useAttachToEditorPost', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockSaveEntityRecord.mockResolvedValue( {} );
		mockGetEntityRecord.mockImplementation( async ( _kind, _name, id ) => ( { id, post: null } ) );
	} );

	it.each( [
		[ 'a new image in the post editor', editorShowing( { id: 7 } ), 42, null, 7 ],
		[ 'an edited copy of an image in the post editor', editorShowing( { id: 7 } ), 43, 42, 7 ],
		[
			'a new image in a customised Site Editor template',
			editorShowing( { id: 'twentytwentyfive//single', wp_id: 88 } ),
			42,
			null,
			88,
		],
	] )(
		'attaches %s to what the editor shows, like core',
		async ( _case, editor, attachmentId, originalAttachmentId, expectedParent ) => {
			mockEditorStore = editor;
			const { result } = renderHook( () => useAttachToEditorPost() );

			await result.current( attachmentId, originalAttachmentId );

			expect( mockSaveEntityRecord ).toHaveBeenCalledTimes( 1 );
			expect( mockSaveEntityRecord ).toHaveBeenCalledWith(
				'postType',
				'attachment',
				{ id: attachmentId, post: expectedParent },
				{ throwOnError: true }
			);
		}
	);

	it.each( [
		[ 'the original image, which must never move', editorShowing( { id: 7 } ), 42, 42 ],
		[
			'a Site Editor template never saved to the database',
			editorShowing( { id: 'twentytwentyfive//single', wp_id: 0 } ),
			42,
			null,
		],
		[ 'the Media Library, where the editor shows no post', editorShowing( {} ), 42, null ],
		[ 'a screen without the editor store', undefined, 42, null ],
		[ 'no image', editorShowing( { id: 7 } ), null, null ],
	] )( 'leaves %s alone', async ( _case, editor, attachmentId, originalAttachmentId ) => {
		mockEditorStore = editor;
		const { result } = renderHook( () => useAttachToEditorPost() );

		await result.current( attachmentId, originalAttachmentId );

		expect( mockSaveEntityRecord ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'already belongs to another post', async () => ( { id: 42, post: 99 } ) ],
		[ "can't be read", async () => undefined ],
	] )( 'leaves an image alone when it %s', async ( _case, record ) => {
		mockEditorStore = editorShowing( { id: 7 } );
		mockGetEntityRecord.mockImplementation( record );
		const { result } = renderHook( () => useAttachToEditorPost() );

		await result.current( 42, null );

		expect( mockSaveEntityRecord ).not.toHaveBeenCalled();
	} );

	it( 'keeps the save going and reports it when the site refuses the attach', async () => {
		mockEditorStore = editorShowing( { id: 7 } );
		mockSaveEntityRecord.mockRejectedValue( new Error( 'rest_cannot_edit' ) );
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const { result } = renderHook( () => useAttachToEditorPost() );

		await expect( result.current( 42, 41 ) ).resolves.toBeUndefined();
		expect( consoleError ).toHaveBeenCalled();
		expect( mockTrackImageStudioError ).toHaveBeenCalledWith( {
			mode: 'edit',
			errorType: 'attach_to_post_failed',
			attachmentId: 42,
		} );

		consoleError.mockRestore();
	} );

	it( 'keeps the save going and reports it when the image lookup fails', async () => {
		mockEditorStore = editorShowing( { id: 7 } );
		mockGetEntityRecord.mockRejectedValue( new Error( 'rest_forbidden' ) );
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const { result } = renderHook( () => useAttachToEditorPost() );

		await expect( result.current( 42, null ) ).resolves.toBeUndefined();
		expect( mockSaveEntityRecord ).not.toHaveBeenCalled();
		expect( consoleError ).toHaveBeenCalled();
		expect( mockTrackImageStudioError ).toHaveBeenCalledWith( {
			mode: 'generate',
			errorType: 'attach_to_post_failed',
			attachmentId: 42,
		} );

		consoleError.mockRestore();
	} );
} );
