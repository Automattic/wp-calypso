/**
 * External dependencies
 */
import { noop, set, reduce } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	getBlockTypes,
	unregisterBlockType,
	registerBlockType,
	createBlock,
} from '@wordpress/blocks';
import apiRequest from '@wordpress/api-request';

/**
 * Internal dependencies
 */
import {
	setupEditorState,
	mergeBlocks,
	replaceBlocks,
	selectBlock,
	removeBlock,
	createErrorNotice,
	fetchSharedBlocks,
	receiveSharedBlocks,
	receiveBlocks,
	saveSharedBlock,
	deleteSharedBlock,
	removeBlocks,
	resetBlocks,
	convertBlockToStatic,
	convertBlockToShared,
	setTemplateValidity,
	editPost,
} from '../actions';
import effects, {
	removeProvisionalBlock,
} from '../effects';
import * as selectors from '../selectors';
import reducer from '../reducer';

describe( 'effects', () => {
	const defaultBlockSettings = { save: () => 'Saved', category: 'common', title: 'block title' };

	describe( 'removeProvisionalBlock()', () => {
		const store = { getState: () => {} };

		beforeAll( () => {
			selectors.getProvisionalBlockUID = jest.spyOn( selectors, 'getProvisionalBlockUID' );
			selectors.isBlockSelected = jest.spyOn( selectors, 'isBlockSelected' );
		} );

		beforeEach( () => {
			selectors.getProvisionalBlockUID.mockReset();
			selectors.isBlockSelected.mockReset();
		} );

		afterAll( () => {
			selectors.getProvisionalBlockUID.mockRestore();
			selectors.isBlockSelected.mockRestore();
		} );

		it( 'should return nothing if there is no provisional block', () => {
			const action = removeProvisionalBlock( {}, store );

			expect( action ).toBeUndefined();
		} );

		it( 'should return nothing if there is a provisional block and it is selected', () => {
			selectors.getProvisionalBlockUID.mockReturnValue( 'chicken' );
			selectors.isBlockSelected.mockImplementation( ( state, uid ) => uid === 'chicken' );
			const action = removeProvisionalBlock( {}, store );

			expect( action ).toBeUndefined();
		} );

		it( 'should return remove action for provisional block', () => {
			selectors.getProvisionalBlockUID.mockReturnValue( 'chicken' );
			selectors.isBlockSelected.mockImplementation( ( state, uid ) => uid === 'ribs' );
			const action = removeProvisionalBlock( {}, store );

			expect( action ).toEqual( removeBlock( 'chicken', false ) );
		} );
	} );

	describe( '.MERGE_BLOCKS', () => {
		const handler = effects.MERGE_BLOCKS;
		const defaultGetBlock = selectors.getBlock;

		afterEach( () => {
			getBlockTypes().forEach( ( block ) => {
				unregisterBlockType( block.name );
			} );
			selectors.getBlock = defaultGetBlock;
		} );

		it( 'should only focus the blockA if the blockA has no merge function', () => {
			registerBlockType( 'core/test-block', defaultBlockSettings );
			const blockA = {
				uid: 'chicken',
				name: 'core/test-block',
			};
			const blockB = {
				uid: 'ribs',
				name: 'core/test-block',
			};
			selectors.getBlock = ( state, uid ) => {
				return blockA.uid === uid ? blockA : blockB;
			};

			const dispatch = jest.fn();
			const getState = () => ( {} );
			handler( mergeBlocks( blockA.uid, blockB.uid ), { dispatch, getState } );

			expect( dispatch ).toHaveBeenCalledTimes( 1 );
			expect( dispatch ).toHaveBeenCalledWith( selectBlock( 'chicken' ) );
		} );

		it( 'should merge the blocks if blocks of the same type', () => {
			registerBlockType( 'core/test-block', {
				merge( attributes, attributesToMerge ) {
					return {
						content: attributes.content + ' ' + attributesToMerge.content,
					};
				},
				save: noop,
				category: 'common',
				title: 'test block',
			} );
			const blockA = {
				uid: 'chicken',
				name: 'core/test-block',
				attributes: { content: 'chicken' },
			};
			const blockB = {
				uid: 'ribs',
				name: 'core/test-block',
				attributes: { content: 'ribs' },
			};
			selectors.getBlock = ( state, uid ) => {
				return blockA.uid === uid ? blockA : blockB;
			};
			const dispatch = jest.fn();
			const getState = () => ( {} );
			handler( mergeBlocks( blockA.uid, blockB.uid ), { dispatch, getState } );

			expect( dispatch ).toHaveBeenCalledTimes( 2 );
			expect( dispatch ).toHaveBeenCalledWith( selectBlock( 'chicken', -1 ) );
			expect( dispatch ).toHaveBeenCalledWith( {
				...replaceBlocks( [ 'chicken', 'ribs' ], [ {
					uid: 'chicken',
					name: 'core/test-block',
					attributes: { content: 'chicken ribs' },
				} ] ),
				time: expect.any( Number ),
			} );
		} );

		it( 'should not merge the blocks have different types without transformation', () => {
			registerBlockType( 'core/test-block', {
				merge( attributes, attributesToMerge ) {
					return {
						content: attributes.content + ' ' + attributesToMerge.content,
					};
				},
				save: noop,
				category: 'common',
				title: 'test block',
			} );
			registerBlockType( 'core/test-block-2', defaultBlockSettings );
			const blockA = {
				uid: 'chicken',
				name: 'core/test-block',
				attributes: { content: 'chicken' },
			};
			const blockB = {
				uid: 'ribs',
				name: 'core/test-block2',
				attributes: { content: 'ribs' },
			};
			selectors.getBlock = ( state, uid ) => {
				return blockA.uid === uid ? blockA : blockB;
			};
			const dispatch = jest.fn();
			const getState = () => ( {} );
			handler( mergeBlocks( blockA.uid, blockB.uid ), { dispatch, getState } );

			expect( dispatch ).not.toHaveBeenCalled();
		} );

		it( 'should transform and merge the blocks', () => {
			registerBlockType( 'core/test-block', {
				attributes: {
					content: {
						type: 'string',
					},
				},
				merge( attributes, attributesToMerge ) {
					return {
						content: attributes.content + ' ' + attributesToMerge.content,
					};
				},
				save: noop,
				category: 'common',
				title: 'test block',
			} );
			registerBlockType( 'core/test-block-2', {
				attributes: {
					content: {
						type: 'string',
					},
				},
				transforms: {
					to: [ {
						type: 'block',
						blocks: [ 'core/test-block' ],
						transform: ( { content2 } ) => {
							return createBlock( 'core/test-block', {
								content: content2,
							} );
						},
					} ],
				},
				save: noop,
				category: 'common',
				title: 'test block 2',
			} );
			const blockA = {
				uid: 'chicken',
				name: 'core/test-block',
				attributes: { content: 'chicken' },
			};
			const blockB = {
				uid: 'ribs',
				name: 'core/test-block-2',
				attributes: { content2: 'ribs' },
			};
			selectors.getBlock = ( state, uid ) => {
				return blockA.uid === uid ? blockA : blockB;
			};
			const dispatch = jest.fn();
			const getState = () => ( {} );
			handler( mergeBlocks( blockA.uid, blockB.uid ), { dispatch, getState } );

			expect( dispatch ).toHaveBeenCalledTimes( 2 );
			// expect( dispatch ).toHaveBeenCalledWith( focusBlock( 'chicken', { offset: -1 } ) );
			expect( dispatch ).toHaveBeenCalledWith( {
				...replaceBlocks( [ 'chicken', 'ribs' ], [ {
					uid: 'chicken',
					name: 'core/test-block',
					attributes: { content: 'chicken ribs' },
				} ] ),
				time: expect.any( Number ),
			} );
		} );
	} );

	describe( '.REQUEST_POST_UPDATE_SUCCESS', () => {
		const handler = effects.REQUEST_POST_UPDATE_SUCCESS;

		function createGetState( hasLingeringEdits = false ) {
			let state = reducer( undefined, {} );
			if ( hasLingeringEdits ) {
				state = reducer( state, editPost( { edited: true } ) );
			}

			const getState = () => state;
			return getState;
		}

		const defaultPost = {
			id: 1,
			title: {
				raw: 'A History of Pork',
			},
			content: {
				raw: '',
			},
		};
		const getDraftPost = () => ( {
			...defaultPost,
			status: 'draft',
		} );
		const getPublishedPost = () => ( {
			...defaultPost,
			status: 'publish',
		} );

		it( 'should dispatch notices when publishing or scheduling a post', () => {
			const dispatch = jest.fn();
			const store = { dispatch, getState: createGetState() };

			const previousPost = getDraftPost();
			const post = getPublishedPost();

			handler( { post, previousPost }, store );

			expect( dispatch ).toHaveBeenCalledTimes( 1 );
			expect( dispatch ).toHaveBeenCalledWith( expect.objectContaining( {
				notice: {
					content: <p>Post published!{ ' ' }<a>View post</a></p>, // eslint-disable-line jsx-a11y/anchor-is-valid
					id: 'SAVE_POST_NOTICE_ID',
					isDismissible: true,
					status: 'success',
					spokenMessage: 'Post published!',
				},
				type: 'CREATE_NOTICE',
			} ) );
		} );

		it( 'should dispatch notices when reverting a published post to a draft', () => {
			const dispatch = jest.fn();
			const store = { dispatch, getState: createGetState() };

			const previousPost = getPublishedPost();
			const post = getDraftPost();

			handler( { post, previousPost }, store );

			expect( dispatch ).toHaveBeenCalledTimes( 1 );
			expect( dispatch ).toHaveBeenCalledWith( expect.objectContaining( {
				notice: {
					content: <p>
						Post reverted to draft.
						{ ' ' }
						{ false }
					</p>,
					id: 'SAVE_POST_NOTICE_ID',
					isDismissible: true,
					status: 'success',
					spokenMessage: 'Post reverted to draft.',
				},
				type: 'CREATE_NOTICE',
			} ) );
		} );

		it( 'should dispatch notices when just updating a published post again', () => {
			const dispatch = jest.fn();
			const store = { dispatch, getState: createGetState() };

			const previousPost = getPublishedPost();
			const post = getPublishedPost();

			handler( { post, previousPost }, store );

			expect( dispatch ).toHaveBeenCalledTimes( 1 );
			expect( dispatch ).toHaveBeenCalledWith( expect.objectContaining( {
				notice: {
					content: <p>Post updated!{ ' ' }<a>{ 'View post' }</a></p>, // eslint-disable-line jsx-a11y/anchor-is-valid
					id: 'SAVE_POST_NOTICE_ID',
					isDismissible: true,
					status: 'success',
					spokenMessage: 'Post updated!',
				},
				type: 'CREATE_NOTICE',
			} ) );
		} );

		it( 'should do nothing if the updated post was autosaved', () => {
			const dispatch = jest.fn();
			const store = { dispatch, getState: createGetState() };

			const previousPost = getPublishedPost();
			const post = { ...getPublishedPost(), id: defaultPost.id + 1 };

			handler( { post, previousPost, isAutosave: true }, store );

			expect( dispatch ).toHaveBeenCalledTimes( 0 );
		} );

		it( 'should dispatch dirtying action if edits linger after autosave', () => {
			const dispatch = jest.fn();
			const store = { dispatch, getState: createGetState( true ) };

			const previousPost = getPublishedPost();
			const post = { ...getPublishedPost(), id: defaultPost.id + 1 };

			handler( { post, previousPost, isAutosave: true }, store );

			expect( dispatch ).toHaveBeenCalledTimes( 1 );
			expect( dispatch ).toHaveBeenCalledWith( { type: 'DIRTY_ARTIFICIALLY' } );
		} );
	} );

	describe( '.REQUEST_POST_UPDATE_FAILURE', () => {
		it( 'should dispatch a notice on failure when publishing a draft fails.', () => {
			const handler = effects.REQUEST_POST_UPDATE_FAILURE;
			const dispatch = jest.fn();
			const store = { getState: () => {}, dispatch };

			const action = {
				post: {
					id: 1,
					title: {
						raw: 'A History of Pork',
					},
					content: {
						raw: '',
					},
					status: 'draft',
				},
				edits: {
					status: 'publish',
				},
			};

			handler( action, store );

			expect( dispatch ).toHaveBeenCalledTimes( 1 );
			expect( dispatch ).toHaveBeenCalledWith( createErrorNotice( 'Publishing failed', { id: 'SAVE_POST_NOTICE_ID' } ) );
		} );

		it( 'should not dispatch a notice when there were no changes for autosave to save.', () => {
			const handler = effects.REQUEST_POST_UPDATE_FAILURE;
			const dispatch = jest.fn();
			const store = { getState: () => {}, dispatch };

			const action = {
				post: {
					id: 1,
					title: {
						raw: 'A History of Pork',
					},
					content: {
						raw: '',
					},
					status: 'draft',
				},
				edits: {
					status: 'publish',
				},
				error: {
					code: 'rest_autosave_no_changes',
				},
			};

			handler( action, store );

			expect( dispatch ).toHaveBeenCalledTimes( 0 );
		} );

		it( 'should dispatch a notice on failure when trying to update a draft.', () => {
			const handler = effects.REQUEST_POST_UPDATE_FAILURE;
			const dispatch = jest.fn();
			const store = { getState: () => {}, dispatch };

			const action = {
				post: {
					id: 1,
					title: {
						raw: 'A History of Pork',
					},
					content: {
						raw: '',
					},
					status: 'draft',
				},
				edits: {
					status: 'draft',
				},
			};

			handler( action, store );

			expect( dispatch ).toHaveBeenCalledTimes( 1 );
			expect( dispatch ).toHaveBeenCalledWith( createErrorNotice( 'Updating failed', { id: 'SAVE_POST_NOTICE_ID' } ) );
		} );
	} );

	describe( '.SETUP_EDITOR', () => {
		const handler = effects.SETUP_EDITOR;

		afterEach( () => {
			getBlockTypes().forEach( ( block ) => {
				unregisterBlockType( block.name );
			} );
		} );

		it( 'should return post reset action', () => {
			const post = {
				id: 1,
				title: {
					raw: 'A History of Pork',
				},
				content: {
					raw: '',
				},
				status: 'draft',
			};
			const getState = () => ( {
				settings: {
					template: null,
					templateLock: false,
				},
			} );

			const result = handler( { post, settings: {} }, { getState } );

			expect( result ).toEqual( [
				setTemplateValidity( true ),
				setupEditorState( post, [], {} ),
			] );
		} );

		it( 'should return block reset with non-empty content', () => {
			registerBlockType( 'core/test-block', defaultBlockSettings );
			const post = {
				id: 1,
				title: {
					raw: 'A History of Pork',
				},
				content: {
					raw: '<!-- wp:core/test-block -->Saved<!-- /wp:core/test-block -->',
				},
				status: 'draft',
			};
			const getState = () => ( {
				settings: {
					template: null,
					templateLock: false,
				},
			} );

			const result = handler( { post }, { getState } );

			expect( result[ 1 ].blocks ).toHaveLength( 1 );
			expect( result ).toEqual( [
				setTemplateValidity( true ),
				setupEditorState( post, result[ 1 ].blocks, {} ),
			] );
		} );

		it( 'should return post setup action only if auto-draft', () => {
			const post = {
				id: 1,
				title: {
					raw: 'A History of Pork',
				},
				content: {
					raw: '',
				},
				status: 'auto-draft',
			};
			const getState = () => ( {
				settings: {
					template: null,
					templateLock: false,
				},
			} );

			const result = handler( { post }, { getState } );

			expect( result ).toEqual( [
				setTemplateValidity( true ),
				setupEditorState( post, [], { title: 'A History of Pork' } ),
			] );
		} );
	} );

	describe( 'shared block effects', () => {
		beforeAll( () => {
			registerBlockType( 'core/test-block', {
				title: 'Test block',
				category: 'common',
				save: () => null,
				attributes: {
					name: { type: 'string' },
				},
			} );
			registerBlockType( 'core/block', {
				title: 'Shared Block',
				category: 'common',
				save: () => null,
				attributes: {
					ref: { type: 'string' },
				},
			} );
		} );

		afterAll( () => {
			unregisterBlockType( 'core/test-block' );
			unregisterBlockType( 'core/block' );
		} );

		describe( '.FETCH_SHARED_BLOCKS', () => {
			const handler = effects.FETCH_SHARED_BLOCKS;

			afterEach( () => {
				jest.unmock( '@wordpress/api-request' );
			} );

			it( 'should fetch multiple shared blocks', () => {
				const promise = Promise.resolve( [
					{
						id: 123,
						title: 'My cool block',
						content: '<!-- wp:test-block {"name":"Big Bird"} /-->',
					},
				] );
				apiRequest.mockReturnValue = promise;
				set( global, [ 'wp', 'api', 'getPostTypeRoute' ], () => 'blocks' );

				const dispatch = jest.fn();
				const store = { getState: noop, dispatch };

				handler( fetchSharedBlocks(), store );

				return promise.then( () => {
					expect( dispatch ).toHaveBeenCalledWith(
						receiveSharedBlocks( [
							{
								sharedBlock: {
									id: 123,
									title: 'My cool block',
									content: '<!-- wp:test-block {"name":"Big Bird"} /-->',
								},
								parsedBlock: expect.objectContaining( {
									name: 'core/test-block',
									attributes: { name: 'Big Bird' },
								} ),
							},
						] )
					);
					expect( dispatch ).toHaveBeenCalledWith( {
						type: 'FETCH_SHARED_BLOCKS_SUCCESS',
						id: undefined,
					} );
				} );
			} );

			it( 'should fetch a single shared block', () => {
				const promise = Promise.resolve( {
					id: 123,
					title: 'My cool block',
					content: '<!-- wp:test-block {"name":"Big Bird"} /-->',
				} );
				apiRequest.mockReturnValue = promise;
				set( global, [ 'wp', 'api', 'getPostTypeRoute' ], () => 'blocks' );

				const dispatch = jest.fn();
				const store = { getState: noop, dispatch };

				handler( fetchSharedBlocks( 123 ), store );

				return promise.then( () => {
					expect( dispatch ).toHaveBeenCalledWith(
						receiveSharedBlocks( [
							{
								sharedBlock: {
									id: 123,
									title: 'My cool block',
									content: '<!-- wp:test-block {"name":"Big Bird"} /-->',
								},
								parsedBlock: expect.objectContaining( {
									name: 'core/test-block',
									attributes: { name: 'Big Bird' },
								} ),
							},
						] )
					);
					expect( dispatch ).toHaveBeenCalledWith( {
						type: 'FETCH_SHARED_BLOCKS_SUCCESS',
						id: 123,
					} );
				} );
			} );

			it( 'should handle an API error', () => {
				const promise = Promise.reject( {} );
				apiRequest.mockReturnValue = promise;
				set( global, [ 'wp', 'api', 'getPostTypeRoute' ], () => 'blocks' );

				const dispatch = jest.fn();
				const store = { getState: noop, dispatch };

				handler( fetchSharedBlocks(), store );

				return promise.catch( () => {
					expect( dispatch ).toHaveBeenCalledWith( {
						type: 'FETCH_SHARED_BLOCKS_FAILURE',
						error: {
							code: 'unknown_error',
							message: 'An unknown error occurred.',
						},
					} );
				} );
			} );
		} );

		describe( '.RECEIVE_SHARED_BLOCKS', () => {
			const handler = effects.RECEIVE_SHARED_BLOCKS;

			it( 'should receive parsed blocks', () => {
				const action = receiveSharedBlocks( [
					{
						parsedBlock: { uid: 'broccoli' },
					},
				] );

				expect( handler( action ) ).toEqual( receiveBlocks( [
					{ uid: 'broccoli' },
				] ) );
			} );
		} );

		describe( '.SAVE_SHARED_BLOCK', () => {
			const handler = effects.SAVE_SHARED_BLOCK;

			it( 'should save a shared block and swap its id', () => {
				const promise = Promise.resolve( { id: 456 } );
				apiRequest.mockReturnValue = promise;

				set( global, [ 'wp', 'api', 'getPostTypeRoute' ], () => 'blocks' );

				const sharedBlock = { id: 123, title: 'My cool block' };
				const parsedBlock = createBlock( 'core/test-block', { name: 'Big Bird' } );

				const state = reduce( [
					receiveSharedBlocks( [ { sharedBlock, parsedBlock } ] ),
					receiveBlocks( [ parsedBlock ] ),
				], reducer, undefined );

				const dispatch = jest.fn();
				const store = { getState: () => state, dispatch };

				handler( saveSharedBlock( 123 ), store );

				return promise.then( () => {
					expect( dispatch ).toHaveBeenCalledWith( {
						type: 'SAVE_SHARED_BLOCK_SUCCESS',
						id: 123,
						updatedId: 456,
					} );
				} );
			} );

			it( 'should handle an API error', () => {
				const promise = Promise.reject( {} );
				apiRequest.mockReturnValue = promise;
				set( global, [ 'wp', 'api', 'getPostTypeRoute' ], () => 'blocks' );

				const sharedBlock = { id: 123, title: 'My cool block' };
				const parsedBlock = createBlock( 'core/test-block', { name: 'Big Bird' } );

				const state = reduce( [
					receiveSharedBlocks( [ { sharedBlock, parsedBlock } ] ),
					receiveBlocks( [ parsedBlock ] ),
				], reducer, undefined );

				const dispatch = jest.fn();
				const store = { getState: () => state, dispatch };

				handler( saveSharedBlock( 123 ), store );

				return promise.catch( () => {
					expect( dispatch ).toHaveBeenCalledWith( {
						type: 'SAVE_SHARED_BLOCK_FAILURE',
						id: 123,
					} );
				} );
			} );
		} );

		describe( '.DELETE_SHARED_BLOCK', () => {
			const handler = effects.DELETE_SHARED_BLOCK;

			it( 'should delete a shared block', () => {
				const promise = Promise.resolve( {} );
				apiRequest.mockReturnValue = promise;
				set( global, [ 'wp', 'api', 'getPostTypeRoute' ], () => 'blocks' );

				const associatedBlock = createBlock( 'core/block', { ref: 123 } );
				const sharedBlock = { id: 123, title: 'My cool block' };
				const parsedBlock = createBlock( 'core/test-block', { name: 'Big Bird' } );

				const state = reduce( [
					resetBlocks( [ associatedBlock ] ),
					receiveSharedBlocks( [ { sharedBlock, parsedBlock } ] ),
					receiveBlocks( [ parsedBlock ] ),
				], reducer, undefined );

				const dispatch = jest.fn();
				const store = { getState: () => state, dispatch };

				handler( deleteSharedBlock( 123 ), store );

				expect( dispatch ).toHaveBeenCalledWith( {
					type: 'REMOVE_SHARED_BLOCK',
					id: 123,
					optimist: expect.any( Object ),
				} );

				expect( dispatch ).toHaveBeenCalledWith(
					removeBlocks( [ associatedBlock.uid, parsedBlock.uid ] )
				);

				return promise.then( () => {
					expect( dispatch ).toHaveBeenCalledWith( {
						type: 'DELETE_SHARED_BLOCK_SUCCESS',
						id: 123,
						optimist: expect.any( Object ),
					} );
				} );
			} );

			it( 'should handle an API error', () => {
				const promise = Promise.reject( {} );
				apiRequest.mockReturnValue = promise;
				set( global, [ 'wp', 'api', 'getPostTypeRoute' ], () => 'blocks' );

				const sharedBlock = { id: 123, title: 'My cool block' };
				const parsedBlock = createBlock( 'core/test-block', { name: 'Big Bird' } );

				const state = reduce( [
					receiveSharedBlocks( [ { sharedBlock, parsedBlock } ] ),
					receiveBlocks( [ parsedBlock ] ),
				], reducer, undefined );

				const dispatch = jest.fn();
				const store = { getState: () => state, dispatch };

				handler( deleteSharedBlock( 123 ), store );

				return promise.catch( () => {
					expect( dispatch ).toHaveBeenCalledWith( {
						type: 'DELETE_SHARED_BLOCK_FAILURE',
						id: 123,
						optimist: expect.any( Object ),
					} );
				} );
			} );

			it( 'should not save shared blocks with temporary IDs', () => {
				const sharedBlock = { id: 'shared1', title: 'My cool block' };
				const parsedBlock = createBlock( 'core/test-block', { name: 'Big Bird' } );

				const state = reduce( [
					receiveSharedBlocks( [ { sharedBlock, parsedBlock } ] ),
					receiveBlocks( [ parsedBlock ] ),
				], reducer, undefined );

				const dispatch = jest.fn();
				const store = { getState: () => state, dispatch };

				handler( deleteSharedBlock( 'shared1' ), store );

				expect( dispatch ).not.toHaveBeenCalled();
			} );
		} );

		describe( '.CONVERT_BLOCK_TO_STATIC', () => {
			const handler = effects.CONVERT_BLOCK_TO_STATIC;

			it( 'should convert a shared block into a static block', () => {
				const associatedBlock = createBlock( 'core/block', { ref: 123 } );
				const sharedBlock = { id: 123, title: 'My cool block' };
				const parsedBlock = createBlock( 'core/test-block', { name: 'Big Bird' } );

				const state = reduce( [
					resetBlocks( [ associatedBlock ] ),
					receiveSharedBlocks( [ { sharedBlock, parsedBlock } ] ),
					receiveBlocks( [ parsedBlock ] ),
				], reducer, undefined );

				const dispatch = jest.fn();
				const store = { getState: () => state, dispatch };

				handler( convertBlockToStatic( associatedBlock.uid ), store );

				expect( dispatch ).toHaveBeenCalledWith( {
					type: 'REPLACE_BLOCKS',
					uids: [ associatedBlock.uid ],
					blocks: [
						expect.objectContaining( {
							name: 'core/test-block',
							attributes: { name: 'Big Bird' },
						} ),
					],
					time: expect.any( Number ),
				} );
			} );
		} );

		describe( '.CONVERT_BLOCK_TO_SHARED', () => {
			const handler = effects.CONVERT_BLOCK_TO_SHARED;

			it( 'should convert a static block into a shared block', () => {
				const staticBlock = createBlock( 'core/block', { ref: 123 } );
				const state = reducer( undefined, resetBlocks( [ staticBlock ] ) );

				const dispatch = jest.fn();
				const store = { getState: () => state, dispatch };

				handler( convertBlockToShared( staticBlock.uid ), store );

				expect( dispatch ).toHaveBeenCalledWith(
					receiveSharedBlocks( [ {
						sharedBlock: {
							id: expect.stringMatching( /^shared/ ),
							uid: staticBlock.uid,
							title: 'Untitled shared block',
						},
						parsedBlock: staticBlock,
					} ] )
				);

				expect( dispatch ).toHaveBeenCalledWith(
					saveSharedBlock( expect.stringMatching( /^shared/ ) ),
				);

				expect( dispatch ).toHaveBeenCalledWith( {
					type: 'REPLACE_BLOCKS',
					uids: [ staticBlock.uid ],
					blocks: [
						expect.objectContaining( {
							name: 'core/block',
							attributes: { ref: expect.stringMatching( /^shared/ ) },
						} ),
					],
					time: expect.any( Number ),
				} );

				expect( dispatch ).toHaveBeenCalledWith(
					receiveBlocks( [ staticBlock ] ),
				);
			} );
		} );
	} );
} );
