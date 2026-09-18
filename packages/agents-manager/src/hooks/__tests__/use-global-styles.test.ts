/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useGlobalStyles from '../use-global-styles';

let mockGlobalStylesId: string | null = 'global-styles-1';
const mockRecord = { styles: { color: { text: '#000' } } };

jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( {
	useSelect: ( callback: ( select: ( store: string ) => unknown ) => unknown ) =>
		callback( () => ( {
			__experimentalGetCurrentGlobalStylesId: () => mockGlobalStylesId,
			getEditedEntityRecord: () => mockRecord,
		} ) ),
} ) );

describe( 'useGlobalStyles', () => {
	it( 'returns the id and the edited record', () => {
		mockGlobalStylesId = 'global-styles-1';

		const { result } = renderHook( () => useGlobalStyles() );

		expect( result.current ).toEqual( {
			globalStylesId: 'global-styles-1',
			globalStyles: mockRecord,
		} );
	} );

	it( 'returns nulls while the id is unavailable', () => {
		mockGlobalStylesId = null;

		const { result } = renderHook( () => useGlobalStyles() );

		expect( result.current ).toEqual( { globalStylesId: null, globalStyles: null } );
	} );
} );
