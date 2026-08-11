import { describe, expect, it } from 'vitest';
import { useClientToolsWithAbilities } from '../useClientTools';

describe( 'useClientTools hooks', () => {
	describe( 'validation', () => {
		it( 'useClientToolsWithAbilities should throw if neither provided', () => {
			expect( () => {
				useClientToolsWithAbilities( {} );
			} ).toThrow( 'At least one of getClientTools or abilities' );
		} );

		it( 'useClientToolsWithAbilities should throw if getClientTools without executeTool', () => {
			const mockGetTools = async () => [];

			expect( () => {
				useClientToolsWithAbilities( {
					getClientTools: mockGetTools,
				} );
			} ).toThrow( 'executeTool is required' );
		} );
	} );
} );
