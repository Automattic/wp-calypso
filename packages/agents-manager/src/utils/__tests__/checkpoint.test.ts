import { hasCheckpoint, restoreCheckpoint, setCheckpoint } from '../checkpoint';

const mockGetEditedEntityRecord = jest.fn( () => ( {
	settings: { color: { palette: {} } },
	styles: { color: { text: '#000' } },
} ) );
const mockEditEntityRecord = jest.fn();
const mockGlobalStylesId = 'global-styles-1';

jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( {
	select: () => ( {
		__experimentalGetCurrentGlobalStylesId: () => mockGlobalStylesId,
		getEditedEntityRecord: mockGetEditedEntityRecord,
	} ),
	dispatch: () => ( { editEntityRecord: mockEditEntityRecord } ),
} ) );

beforeEach( () => jest.clearAllMocks() );

describe( 'checkpoint', () => {
	describe( 'setCheckpoint', () => {
		it( 'captures global styles and stores by ID', () => {
			setCheckpoint( 'set-1' );

			expect( mockGetEditedEntityRecord ).toHaveBeenCalledWith(
				'root',
				'globalStyles',
				mockGlobalStylesId
			);
			expect( hasCheckpoint( 'set-1' ) ).toBe( true );
		} );

		it( 'does nothing when `id` is empty', () => {
			setCheckpoint( '' );

			expect( mockGetEditedEntityRecord ).not.toHaveBeenCalled();
			expect( hasCheckpoint( '' ) ).toBe( false );
		} );
	} );

	describe( 'restoreCheckpoint', () => {
		it( 'restores global styles', async () => {
			setCheckpoint( 'restore-1' );

			await restoreCheckpoint( 'restore-1' );

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
			await restoreCheckpoint( 'non-existent' );

			expect( mockEditEntityRecord ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'hasCheckpoint', () => {
		it( 'returns `false` when no checkpoint exists', () => {
			expect( hasCheckpoint( 'unknown' ) ).toBe( false );
		} );
	} );
} );
