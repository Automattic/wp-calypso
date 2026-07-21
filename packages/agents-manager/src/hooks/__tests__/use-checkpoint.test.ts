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
const mockGlobalStylesId = 'global-styles-1';

jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( callback: ( select: ( store: string ) => unknown ) => unknown ) =>
		callback( () => ( {
			__experimentalGetCurrentGlobalStylesId: () => mockGlobalStylesId,
			getEditedEntityRecord: mockGetEditedEntityRecord,
		} ) ),
	useDispatch: () => ( {
		editEntityRecord: mockEditEntityRecord,
	} ),
} ) );

describe( 'useCheckpoint', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'setCheckpoint', () => {
		it( 'captures global styles and stores by ID', () => {
			const { result } = renderHook( () => useCheckpoint() );

			act( () => {
				result.current.setCheckpoint( 'msg-1' );
			} );

			expect( mockGetEditedEntityRecord ).toHaveBeenCalledWith(
				'root',
				'globalStyles',
				mockGlobalStylesId
			);
			expect( result.current.hasCheckpoint( 'msg-1' ) ).toBe( true );
		} );

		it( 'does nothing when `id` is empty', () => {
			const { result } = renderHook( () => useCheckpoint() );

			act( () => {
				result.current.setCheckpoint( '' );
			} );

			expect( mockGetEditedEntityRecord ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'restoreCheckpoint', () => {
		it( 'restores global styles', async () => {
			const { result } = renderHook( () => useCheckpoint() );

			act( () => {
				result.current.setCheckpoint( 'msg-1' );
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
		} );

		it( 'does nothing for non-existent checkpoint', async () => {
			const { result } = renderHook( () => useCheckpoint() );

			await act( async () => {
				await result.current.restoreCheckpoint( 'non-existent' );
			} );

			expect( mockEditEntityRecord ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'hasCheckpoint', () => {
		it( 'returns `false` when no checkpoint exists', () => {
			const { result } = renderHook( () => useCheckpoint() );
			expect( result.current.hasCheckpoint( 'non-existent' ) ).toBe( false );
		} );

		it( 'returns `true` when a checkpoint exists', () => {
			const { result } = renderHook( () => useCheckpoint() );

			act( () => {
				result.current.setCheckpoint( 'msg-1' );
			} );

			expect( result.current.hasCheckpoint( 'msg-1' ) ).toBe( true );
		} );
	} );
} );
