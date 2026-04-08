/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import useCheckpoint from '../use-checkpoint';

const mockGetEditedEntityRecord = jest.fn( () => ( {
	settings: { color: { palette: {} } },
	styles: { color: { text: '#000' } },
} ) );
const mockEditEntityRecord = jest.fn();
const mockReplaceInnerBlocks = jest.fn();
const mockReplaceTemplatePart = jest.fn();
const mockGetBlocks = jest.fn( () => [] );
const mockGetSectionRootClientId = jest.fn( () => 'section-root' );
const mockGlobalStylesId = 'global-styles-1';

jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/block-editor', () => ( { store: 'block-editor' } ) );

jest.mock( '../../utils/unlock-private-apis', () => ( {
	unlock: () => ( { getSectionRootClientId: mockGetSectionRootClientId } ),
} ) );

jest.mock( '../use-template-parts', () => ( {
	__esModule: true,
	default: () => ( { replaceTemplatePart: mockReplaceTemplatePart } ),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( callback: ( select: ( store: string ) => unknown ) => unknown ) =>
		callback( () => ( {
			__experimentalGetCurrentGlobalStylesId: () => mockGlobalStylesId,
			getEditedEntityRecord: mockGetEditedEntityRecord,
			getBlocks: mockGetBlocks,
			getBlocksByName: jest.fn( () => [] ),
			getBlock: jest.fn( () => null ),
		} ) ),
	useDispatch: () => ( {
		editEntityRecord: mockEditEntityRecord,
		replaceInnerBlocks: mockReplaceInnerBlocks,
	} ),
} ) );

describe( 'useCheckpoint', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'setCheckpoint', () => {
		it( 'captures global styles and blocks, stores by ID', () => {
			const { result } = renderHook( () => useCheckpoint() );

			act( () => {
				result.current.setCheckpoint( 'msg-1', [ 'color' ] );
			} );

			expect( mockGetEditedEntityRecord ).toHaveBeenCalledWith(
				'root',
				'globalStyles',
				mockGlobalStylesId
			);
			expect( result.current.hasCheckpoint( 'msg-1' ) ).toBe( true );

			const state = result.current.getLastEditorState();
			expect( state?.blocks ).toBeDefined();
		} );

		it( 'does nothing when `id` is empty', () => {
			const { result } = renderHook( () => useCheckpoint() );

			act( () => {
				result.current.setCheckpoint( '', [ 'color' ] );
			} );

			expect( mockGetEditedEntityRecord ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'restoreCheckpoint', () => {
		it( 'restores global styles and blocks', async () => {
			const { result } = renderHook( () => useCheckpoint() );

			act( () => {
				result.current.setCheckpoint( 'msg-1', [ 'blocks' ] );
			} );

			await act( async () => {
				await result.current.restoreCheckpoint( 'msg-1' );
			} );

			expect( mockEditEntityRecord ).toHaveBeenCalledWith(
				'root',
				'globalStyles',
				mockGlobalStylesId,
				{
					settings: { color: { palette: {} } },
					styles: { color: { text: '#000' } },
				}
			);
			expect( mockReplaceTemplatePart ).toHaveBeenCalledTimes( 3 );
			expect( mockReplaceInnerBlocks ).toHaveBeenCalledWith( 'section-root', [] );
		} );

		it( 'does nothing for non-existent checkpoint', async () => {
			const { result } = renderHook( () => useCheckpoint() );

			await act( async () => {
				await result.current.restoreCheckpoint( 'non-existent' );
			} );

			expect( mockEditEntityRecord ).not.toHaveBeenCalled();
			expect( mockReplaceTemplatePart ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'hasCheckpoint', () => {
		it( 'returns `false` when no checkpoint exists', () => {
			const { result } = renderHook( () => useCheckpoint() );
			expect( result.current.hasCheckpoint( 'non-existent' ) ).toBe( false );
		} );

		it( 'returns `true` when checkpoint has keys', () => {
			const { result } = renderHook( () => useCheckpoint() );

			act( () => {
				result.current.setCheckpoint( 'msg-1', [ 'color' ] );
			} );

			expect( result.current.hasCheckpoint( 'msg-1' ) ).toBe( true );
		} );
	} );

	describe( 'addCheckpointKeys', () => {
		it( 'deduplicates keys', () => {
			const { result } = renderHook( () => useCheckpoint() );

			act( () => {
				result.current.setCheckpoint( 'msg-1', [ 'color' ] );
				result.current.addCheckpointKeys( 'msg-1', [ 'color', 'font' ] );
			} );

			const state = result.current.getLastEditorState();
			expect( state?.checkpointKeys ).toEqual( [ 'color', 'font' ] );
		} );
	} );

	describe( 'addNewPageToCheckpoint', () => {
		it( 'adds `newPageId` to the last checkpoint', () => {
			const { result } = renderHook( () => useCheckpoint() );

			act( () => {
				result.current.setCheckpoint( 'msg-1', [ 'blocks' ] );
				result.current.addNewPageToCheckpoint( 'page-123' );
			} );

			const state = result.current.getLastEditorState();
			expect( state?.newPageId ).toBe( 'page-123' );
		} );
	} );

	describe( 'clearCheckpoint', () => {
		it( 'removes a checkpoint by ID', () => {
			const { result } = renderHook( () => useCheckpoint() );

			act( () => {
				result.current.setCheckpoint( 'msg-1', [ 'color' ] );
			} );

			expect( result.current.hasCheckpoint( 'msg-1' ) ).toBe( true );

			act( () => {
				result.current.clearCheckpoint( 'msg-1' );
			} );

			expect( result.current.hasCheckpoint( 'msg-1' ) ).toBe( false );
		} );
	} );

	describe( 'getLastEditorState', () => {
		it( 'returns `undefined` when no checkpoints exist', () => {
			const { result } = renderHook( () => useCheckpoint() );
			expect( result.current.getLastEditorState() ).toBeUndefined();
		} );

		it( 'returns the most recently added checkpoint', () => {
			const { result } = renderHook( () => useCheckpoint() );

			act( () => {
				result.current.setCheckpoint( 'msg-1', [ 'color' ] );
				result.current.setCheckpoint( 'msg-2', [ 'font' ] );
			} );

			const state = result.current.getLastEditorState();
			expect( state?.checkpointKeys ).toEqual( [ 'font' ] );
		} );
	} );
} );
