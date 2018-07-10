/**
 * Internal dependencies
 */
import {
	replaceBlocks,
	startTyping,
	stopTyping,
	fetchSharedBlocks,
	saveSharedBlock,
	deleteSharedBlock,
	convertBlockToStatic,
	convertBlockToShared,
	toggleSelection,
	setupEditor,
	resetPost,
	resetBlocks,
	updateBlockAttributes,
	updateBlock,
	selectBlock,
	startMultiSelect,
	stopMultiSelect,
	multiSelect,
	clearSelectedBlock,
	replaceBlock,
	insertBlock,
	insertBlocks,
	showInsertionPoint,
	hideInsertionPoint,
	editPost,
	savePost,
	trashPost,
	mergeBlocks,
	redo,
	undo,
	removeBlocks,
	removeBlock,
	toggleBlockMode,
	createNotice,
	createSuccessNotice,
	createInfoNotice,
	createErrorNotice,
	createWarningNotice,
	removeNotice,
	updateBlockListSettings,
} from '../actions';

describe( 'actions', () => {
	describe( 'setupEditor', () => {
		it( 'should return the SETUP_EDITOR action', () => {
			const post = {};
			const autosave = {};
			const result = setupEditor( post, autosave );
			expect( result ).toEqual( {
				type: 'SETUP_EDITOR',
				post,
				autosave,
			} );
		} );
	} );

	describe( 'resetPost', () => {
		it( 'should return the RESET_POST action', () => {
			const post = {};
			const result = resetPost( post );
			expect( result ).toEqual( {
				type: 'RESET_POST',
				post,
			} );
		} );
	} );
	describe( 'resetBlocks', () => {
		it( 'should return the RESET_BLOCKS actions', () => {
			const blocks = [];
			const result = resetBlocks( blocks );
			expect( result ).toEqual( {
				type: 'RESET_BLOCKS',
				blocks,
			} );
		} );
	} );

	describe( 'updateBlockAttributes', () => {
		it( 'should return the UPDATE_BLOCK_ATTRIBUTES action', () => {
			const uid = 'my-uid';
			const attributes = {};
			const result = updateBlockAttributes( uid, attributes );
			expect( result ).toEqual( {
				type: 'UPDATE_BLOCK_ATTRIBUTES',
				uid,
				attributes,
			} );
		} );
	} );

	describe( 'updateBlock', () => {
		it( 'should return the UPDATE_BLOCK action', () => {
			const uid = 'myuid';
			const updates = {};
			const result = updateBlock( uid, updates );
			expect( result ).toEqual( {
				type: 'UPDATE_BLOCK',
				uid,
				updates,
			} );
		} );
	} );

	describe( 'selectBlock', () => {
		it( 'should return the SELECT_BLOCK action', () => {
			const uid = 'my-uid';
			const result = selectBlock( uid, -1 );
			expect( result ).toEqual( {
				type: 'SELECT_BLOCK',
				initialPosition: -1,
				uid,
			} );
		} );
	} );

	describe( 'startMultiSelect', () => {
		it( 'should return the START_MULTI_SELECT', () => {
			expect( startMultiSelect() ).toEqual( {
				type: 'START_MULTI_SELECT',
			} );
		} );
	} );

	describe( 'stopMultiSelect', () => {
		it( 'should return the Stop_MULTI_SELECT', () => {
			expect( stopMultiSelect() ).toEqual( {
				type: 'STOP_MULTI_SELECT',
			} );
		} );
	} );
	describe( 'multiSelect', () => {
		it( 'should return MULTI_SELECT action', () => {
			const start = 'start';
			const end = 'end';
			expect( multiSelect( start, end ) ).toEqual( {
				type: 'MULTI_SELECT',
				start,
				end,
			} );
		} );
	} );

	describe( 'clearSelectedBlock', () => {
		it( 'should return CLEAR_SELECTED_BLOCK action', () => {
			expect( clearSelectedBlock() ).toEqual( {
				type: 'CLEAR_SELECTED_BLOCK',
			} );
		} );
	} );

	describe( 'replaceBlock', () => {
		it( 'should return the REPLACE_BLOCKS action', () => {
			const block = {
				uid: 'ribs',
			};

			expect( replaceBlock( [ 'chicken' ], block ) ).toEqual( {
				type: 'REPLACE_BLOCKS',
				uids: [ 'chicken' ],
				blocks: [ block ],
				time: expect.any( Number ),
			} );
		} );
	} );

	describe( 'replaceBlocks', () => {
		it( 'should return the REPLACE_BLOCKS action', () => {
			const blocks = [ {
				uid: 'ribs',
			} ];

			expect( replaceBlocks( [ 'chicken' ], blocks ) ).toEqual( {
				type: 'REPLACE_BLOCKS',
				uids: [ 'chicken' ],
				blocks,
				time: expect.any( Number ),
			} );
		} );
	} );

	describe( 'insertBlock', () => {
		it( 'should return the INSERT_BLOCKS action', () => {
			const block = {
				uid: 'ribs',
			};
			const index = 5;
			expect( insertBlock( block, index, 'test_uid' ) ).toEqual( {
				type: 'INSERT_BLOCKS',
				blocks: [ block ],
				index,
				rootUID: 'test_uid',
				time: expect.any( Number ),
			} );
		} );
	} );

	describe( 'insertBlocks', () => {
		it( 'should return the INSERT_BLOCKS action', () => {
			const blocks = [ {
				uid: 'ribs',
			} ];
			const index = 3;
			expect( insertBlocks( blocks, index, 'test_uid' ) ).toEqual( {
				type: 'INSERT_BLOCKS',
				blocks,
				index,
				rootUID: 'test_uid',
				time: expect.any( Number ),
			} );
		} );
	} );

	describe( 'showInsertionPoint', () => {
		it( 'should return the SHOW_INSERTION_POINT action', () => {
			expect( showInsertionPoint() ).toEqual( {
				type: 'SHOW_INSERTION_POINT',
			} );
		} );
	} );

	describe( 'hideInsertionPoint', () => {
		it( 'should return the HIDE_INSERTION_POINT action', () => {
			expect( hideInsertionPoint() ).toEqual( {
				type: 'HIDE_INSERTION_POINT',
			} );
		} );
	} );

	describe( 'editPost', () => {
		it( 'should return EDIT_POST action', () => {
			const edits = { format: 'sample' };
			expect( editPost( edits ) ).toEqual( {
				type: 'EDIT_POST',
				edits,
			} );
		} );
	} );

	describe( 'savePost', () => {
		it( 'should return REQUEST_POST_UPDATE action', () => {
			expect( savePost() ).toEqual( {
				type: 'REQUEST_POST_UPDATE',
				options: {},
			} );
		} );

		it( 'should pass through options argument', () => {
			expect( savePost( { autosave: true } ) ).toEqual( {
				type: 'REQUEST_POST_UPDATE',
				options: { autosave: true },
			} );
		} );
	} );

	describe( 'trashPost', () => {
		it( 'should return TRASH_POST action', () => {
			const postId = 1;
			const postType = 'post';
			expect( trashPost( postId, postType ) ).toEqual( {
				type: 'TRASH_POST',
				postId,
				postType,
			} );
		} );
	} );

	describe( 'mergeBlocks', () => {
		it( 'should return MERGE_BLOCKS action', () => {
			const blockAUid = 'blockA';
			const blockBUid = 'blockB';
			expect( mergeBlocks( blockAUid, blockBUid ) ).toEqual( {
				type: 'MERGE_BLOCKS',
				blocks: [ blockAUid, blockBUid ],
			} );
		} );
	} );

	describe( 'redo', () => {
		it( 'should return REDO action', () => {
			expect( redo() ).toEqual( {
				type: 'REDO',
			} );
		} );
	} );

	describe( 'undo', () => {
		it( 'should return UNDO action', () => {
			expect( undo() ).toEqual( {
				type: 'UNDO',
			} );
		} );
	} );

	describe( 'removeBlocks', () => {
		it( 'should return REMOVE_BLOCKS action', () => {
			const uids = [ 'uid' ];
			expect( removeBlocks( uids ) ).toEqual( {
				type: 'REMOVE_BLOCKS',
				uids,
				selectPrevious: true,
			} );
		} );
	} );

	describe( 'removeBlock', () => {
		it( 'should return REMOVE_BLOCKS action', () => {
			const uid = 'my-uid';
			expect( removeBlock( uid ) ).toEqual( {
				type: 'REMOVE_BLOCKS',
				uids: [
					uid,
				],
				selectPrevious: true,
			} );
			expect( removeBlock( uid, false ) ).toEqual( {
				type: 'REMOVE_BLOCKS',
				uids: [
					uid,
				],
				selectPrevious: false,
			} );
		} );
	} );

	describe( 'toggleBlockMode', () => {
		it( 'should return TOGGLE_BLOCK_MODE action', () => {
			const uid = 'my-uid';
			expect( toggleBlockMode( uid ) ).toEqual( {
				type: 'TOGGLE_BLOCK_MODE',
				uid,
			} );
		} );
	} );

	describe( 'startTyping', () => {
		it( 'should return the START_TYPING action', () => {
			expect( startTyping() ).toEqual( {
				type: 'START_TYPING',
			} );
		} );
	} );

	describe( 'stopTyping', () => {
		it( 'should return the STOP_TYPING action', () => {
			expect( stopTyping() ).toEqual( {
				type: 'STOP_TYPING',
			} );
		} );
	} );

	describe( 'createNotice', () => {
		const status = 'status';
		const content = <p>element</p>;
		it( 'should return CREATE_NOTICE action when options is empty', () => {
			const result = createNotice( status, content );
			expect( result ).toMatchObject( {
				type: 'CREATE_NOTICE',
				notice: {
					status,
					content,
					isDismissible: true,
					id: expect.any( String ),
				},
			} );
		} );
		it( 'should return CREATE_NOTICE action when options is desined', () => {
			const id = 'my-id';
			const options = {
				id,
				isDismissible: false,
			};
			const result = createNotice( status, content, options );
			expect( result ).toEqual( {
				type: 'CREATE_NOTICE',
				notice: {
					id,
					status,
					content,
					isDismissible: false,
				},
			} );
		} );
	} );

	describe( 'createSuccessNotice', () => {
		it( 'should return CREATE_NOTICE action', () => {
			const content = <p>element</p>;
			const result = createSuccessNotice( content );
			expect( result ).toMatchObject( {
				type: 'CREATE_NOTICE',
				notice: {
					status: 'success',
					content,
					isDismissible: true,
					id: expect.any( String ),
				},
			} );
		} );
	} );

	describe( 'createInfoNotice', () => {
		it( 'should return CREATE_NOTICE action', () => {
			const content = <p>element</p>;
			const result = createInfoNotice( content );
			expect( result ).toMatchObject( {
				type: 'CREATE_NOTICE',
				notice: {
					status: 'info',
					content,
					isDismissible: true,
					id: expect.any( String ),
				},
			} );
		} );
	} );

	describe( 'createErrorNotice', () => {
		it( 'should return CREATE_NOTICE action', () => {
			const content = <p>element</p>;
			const result = createErrorNotice( content );
			expect( result ).toMatchObject( {
				type: 'CREATE_NOTICE',
				notice: {
					status: 'error',
					content,
					isDismissible: true,
					id: expect.any( String ),
				},
			} );
		} );
	} );

	describe( 'createWarningNotice', () => {
		it( 'should return CREATE_NOTICE action', () => {
			const content = <p>element</p>;
			const result = createWarningNotice( content );
			expect( result ).toMatchObject( {
				type: 'CREATE_NOTICE',
				notice: {
					status: 'warning',
					content,
					isDismissible: true,
					id: expect.any( String ),
				},
			} );
		} );
	} );

	describe( 'removeNotice', () => {
		it( 'should return REMOVE_NOTICE actions', () => {
			const noticeId = 'id';
			expect( removeNotice( noticeId ) ).toEqual( {
				type: 'REMOVE_NOTICE',
				noticeId,
			} );
		} );
	} );

	describe( 'fetchSharedBlocks', () => {
		it( 'should return the FETCH_SHARED_BLOCKS action', () => {
			expect( fetchSharedBlocks() ).toEqual( {
				type: 'FETCH_SHARED_BLOCKS',
			} );
		} );

		it( 'should take an optional id argument', () => {
			expect( fetchSharedBlocks( 123 ) ).toEqual( {
				type: 'FETCH_SHARED_BLOCKS',
				id: 123,
			} );
		} );
	} );

	describe( 'saveSharedBlock', () => {
		it( 'should return the SAVE_SHARED_BLOCK action', () => {
			expect( saveSharedBlock( 123 ) ).toEqual( {
				type: 'SAVE_SHARED_BLOCK',
				id: 123,
			} );
		} );
	} );

	describe( 'deleteSharedBlock', () => {
		it( 'should return the DELETE_SHARED_BLOCK action', () => {
			expect( deleteSharedBlock( 123 ) ).toEqual( {
				type: 'DELETE_SHARED_BLOCK',
				id: 123,
			} );
		} );
	} );

	describe( 'convertBlockToStatic', () => {
		it( 'should return the CONVERT_BLOCK_TO_STATIC action', () => {
			const uid = '358b59ee-bab3-4d6f-8445-e8c6971a5605';
			expect( convertBlockToStatic( uid ) ).toEqual( {
				type: 'CONVERT_BLOCK_TO_STATIC',
				uid,
			} );
		} );
	} );

	describe( 'convertBlockToShared', () => {
		it( 'should return the CONVERT_BLOCK_TO_SHARED action', () => {
			const uid = '358b59ee-bab3-4d6f-8445-e8c6971a5605';
			expect( convertBlockToShared( uid ) ).toEqual( {
				type: 'CONVERT_BLOCK_TO_SHARED',
				uid,
			} );
		} );
	} );

	describe( 'toggleSelection', () => {
		it( 'should return the TOGGLE_SELECTION action with default value for isSelectionEnabled = true', () => {
			expect( toggleSelection() ).toEqual( {
				type: 'TOGGLE_SELECTION',
				isSelectionEnabled: true,
			} );
		} );

		it( 'should return the TOGGLE_SELECTION action with isSelectionEnabled = true as passed in the argument', () => {
			expect( toggleSelection( true ) ).toEqual( {
				type: 'TOGGLE_SELECTION',
				isSelectionEnabled: true,
			} );
		} );

		it( 'should return the TOGGLE_SELECTION action with isSelectionEnabled = false as passed in the argument', () => {
			expect( toggleSelection( false ) ).toEqual( {
				type: 'TOGGLE_SELECTION',
				isSelectionEnabled: false,
			} );
		} );
	} );

	describe( 'updateBlockListSettings', () => {
		it( 'should return the UPDATE_BLOCK_LIST_SETTINGS with undefined settings', () => {
			expect( updateBlockListSettings( 'chicken' ) ).toEqual( {
				type: 'UPDATE_BLOCK_LIST_SETTINGS',
				id: 'chicken',
				settings: undefined,
			} );
		} );

		it( 'should return the UPDATE_BLOCK_LIST_SETTINGS action with the passed settings', () => {
			expect( updateBlockListSettings( 'chicken', { chicken: 'ribs' } ) ).toEqual( {
				type: 'UPDATE_BLOCK_LIST_SETTINGS',
				id: 'chicken',
				settings: { chicken: 'ribs' },
			} );
		} );
	} );
} );
