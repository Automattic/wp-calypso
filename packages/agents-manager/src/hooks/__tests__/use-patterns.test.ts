/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import usePatterns from '../use-patterns';

const mockInsertBlock = jest.fn();
const mockReplaceBlock = jest.fn();
const mockRemoveBlocks = jest.fn();
const mockGetBlocks = jest.fn( (): Array< { clientId: string; name: string } > => [] );
const mockGetBlockIndex = jest.fn( () => 0 );
const mockGetSectionRootClientId = jest.fn( () => 'root-id' );
const mockGetBlockRemovalRules = jest.fn( (): unknown[] => [] );
const mockSetBlockRemovalRules = jest.fn();
const mockReplaceTemplatePart = jest.fn();

jest.mock( '@wordpress/block-editor', () => ( { store: 'block-editor' } ) );
jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/blocks', () => ( { serialize: jest.fn() } ) );

jest.mock( '../../utils/unlock-private-apis', () => ( {
	unlock: () => ( {
		getSectionRootClientId: mockGetSectionRootClientId,
		getBlockRemovalRules: mockGetBlockRemovalRules,
		setBlockRemovalRules: mockSetBlockRemovalRules,
	} ),
} ) );

jest.mock( '../use-template-parts', () => ( {
	__esModule: true,
	default: () => ( {
		buildTemplatePartId: jest.fn(),
		editTemplatePart: jest.fn(),
		replaceTemplatePart: mockReplaceTemplatePart,
	} ),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( callback: ( select: ( store: string ) => unknown ) => unknown ) =>
		callback( () => ( {
			getBlocks: mockGetBlocks,
			getBlockIndex: mockGetBlockIndex,
		} ) ),
	useDispatch: () => ( {
		insertBlock: mockInsertBlock,
		replaceBlock: mockReplaceBlock,
		removeBlocks: mockRemoveBlocks,
	} ),
} ) );

describe( 'usePatterns', () => {
	beforeEach( () => jest.clearAllMocks() );

	describe( 'insertPattern', () => {
		it( 'delegates to insertBlock', () => {
			const { result } = renderHook( () => usePatterns() );
			const pattern = { id: '1' };

			result.current.insertPattern( pattern, 2, 'root', false );

			expect( mockInsertBlock ).toHaveBeenCalledWith( pattern, 2, 'root', false );
		} );

		it( 'uses default rootClientId and updateSelection', () => {
			const { result } = renderHook( () => usePatterns() );
			result.current.insertPattern( { id: '1' }, 0 );

			expect( mockInsertBlock ).toHaveBeenCalledWith( { id: '1' }, 0, null, true );
		} );
	} );

	describe( 'replacePattern', () => {
		it( 'calls replaceBlock for non-template-part patterns', () => {
			const { result } = renderHook( () => usePatterns() );
			const pattern = { attributes: { metadata: { patternCategory: 'intro' } } };

			result.current.replacePattern( 'client-1', pattern );

			expect( mockReplaceBlock ).toHaveBeenCalledWith( 'client-1', pattern );
			expect( mockReplaceTemplatePart ).not.toHaveBeenCalled();
		} );

		it( 'delegates to replaceTemplatePart for header patterns', async () => {
			const { result } = renderHook( () => usePatterns() );
			const pattern = { attributes: { metadata: { patternCategory: 'header' } } };

			await result.current.replacePattern( 'client-1', pattern );

			expect( mockReplaceTemplatePart ).toHaveBeenCalledWith( 'header', [ pattern ] );
			expect( mockReplaceBlock ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'insertPatterns', () => {
		it( 'inserts multiple patterns and returns client IDs', () => {
			mockGetBlocks.mockReturnValue( [ { clientId: 'existing', name: 'core/paragraph' } ] );

			const { result } = renderHook( () => usePatterns() );
			const patternList = [
				{ blocks: [ { clientId: 'p1' } ] },
				{ blocks: [ { clientId: 'p2' } ] },
			];

			const ids = result.current.insertPatterns( patternList );

			expect( ids ).toEqual( [ 'p1', 'p2' ] );
			expect( mockInsertBlock ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'replaces existing blocks when direction is "replace"', () => {
			mockGetBlocks.mockReturnValue( [ { clientId: 'old-block', name: 'core/paragraph' } ] );

			const { result } = renderHook( () => usePatterns() );
			result.current.insertPatterns( [ { blocks: [ { clientId: 'new' } ] } ], null, 'replace' );

			expect( mockRemoveBlocks ).toHaveBeenCalledWith( [ 'old-block' ], true );
			expect( mockInsertBlock ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'inserts before the specified clientId', () => {
			mockGetBlockIndex.mockReturnValue( 3 );
			mockGetBlocks.mockReturnValue( [ { clientId: 'existing', name: 'core/paragraph' } ] );

			const { result } = renderHook( () => usePatterns() );
			result.current.insertPatterns( [ { blocks: [ { clientId: 'new' } ] } ], 'target', 'before' );

			expect( mockInsertBlock ).toHaveBeenCalledWith( { clientId: 'new' }, 3, 'root-id', true );
		} );

		it( 'temporarily disables block removal rules', () => {
			const rules = [ { id: 'rule-1' } ];
			mockGetBlockRemovalRules.mockReturnValue( rules );
			mockGetBlocks.mockReturnValue( [] );

			const { result } = renderHook( () => usePatterns() );
			result.current.insertPatterns( [ { blocks: [ { clientId: 'p1' } ] } ] );

			expect( mockSetBlockRemovalRules ).toHaveBeenCalledWith( [] );
			expect( mockSetBlockRemovalRules ).toHaveBeenLastCalledWith( rules );
		} );
	} );
} );
