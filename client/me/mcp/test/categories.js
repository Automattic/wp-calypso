import { filterVisibleTools, isReadTool, isToolVisible, isWriteTool } from '../categories';

describe( 'client/me/mcp/categories', () => {
	describe( 'isWriteTool', () => {
		it( 'returns true when annotations.readonly is false', () => {
			expect( isWriteTool( { annotations: { readonly: false } } ) ).toBe( true );
		} );

		it( 'returns false when annotations.readonly is true', () => {
			expect( isWriteTool( { annotations: { readonly: true } } ) ).toBe( false );
		} );

		it( 'returns false when annotations are missing', () => {
			expect( isWriteTool( {} ) ).toBe( false );
		} );

		it( 'prefers the top-level readonly field over annotations.readonly', () => {
			expect( isWriteTool( { readonly: false, annotations: { readonly: true } } ) ).toBe( true );
			expect( isWriteTool( { readonly: true, annotations: { readonly: false } } ) ).toBe( false );
		} );

		it( 'falls back to annotations.readonly when the top-level field is absent', () => {
			expect( isWriteTool( { annotations: { readonly: false } } ) ).toBe( true );
		} );
	} );

	describe( 'isReadTool', () => {
		it( 'is the inverse of isWriteTool for readonly false', () => {
			const tool = { annotations: { readonly: false } };
			expect( isReadTool( tool ) ).toBe( false );
		} );
	} );

	describe( 'isToolVisible', () => {
		it( 'returns false when visible is false', () => {
			expect( isToolVisible( { visible: false } ) ).toBe( false );
		} );

		it( 'returns true when visible is undefined', () => {
			expect( isToolVisible( {} ) ).toBe( true );
		} );
	} );

	describe( 'filterVisibleTools', () => {
		it( 'filters out invisible tools', () => {
			const entries = [
				[ 'a', { visible: true, title: 'A' } ],
				[ 'b', { visible: false, title: 'B' } ],
			];
			expect( filterVisibleTools( entries ).map( ( [ id ] ) => id ) ).toEqual( [ 'a' ] );
		} );
	} );
} );
