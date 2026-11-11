import { renderHook } from '@testing-library/react';
import { useBlockSuggestions } from '../use-block-suggestions';

const mockSelect = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( mapSelect: ( select: typeof mockSelect ) => unknown ) => mapSelect( mockSelect ),
} ) );

function selectBlock( name: string | null ) {
	mockSelect.mockReturnValue( {
		getSelectedBlock: () =>
			name ? { clientId: 'block-1', name, attributes: {}, innerBlocks: [] } : null,
	} );
}

describe( 'useBlockSuggestions', () => {
	it( 'suggests the actions for the selected block, up to the limit', () => {
		selectBlock( 'core/paragraph' );

		const { result } = renderHook( () => useBlockSuggestions( 2 ) );

		expect( result.current.suggestions.map( ( { id } ) => id ) ).toEqual( [
			'translate',
			'change-tone',
		] );
		expect( result.current.replaceEmptyViewSuggestions ).toBe( true );
	} );

	it( 'suggests nothing while no block is selected', () => {
		selectBlock( null );

		const { result } = renderHook( () => useBlockSuggestions() );

		expect( result.current ).toEqual( { suggestions: [], replaceEmptyViewSuggestions: false } );
	} );
} );
