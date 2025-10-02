import { describe, expect, it } from 'vitest';
import {
	useClientAbilities,
	useClientTools,
	useClientToolsWithAbilities,
} from '../useClientTools';

describe( 'useClientTools hooks', () => {
	describe( 'validation', () => {
		it( 'useClientAbilities should throw if executeAbility not provided', () => {
			const ability = {
				name: 'test',
				label: 'Test',
				description: 'Test ability',
			};

			expect( () => {
				// This will throw synchronously during validation
				useClientAbilities( [ ability ], undefined as any );
			} ).toThrow( 'executeAbility is required' );
		} );

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

		it( 'useClientToolsWithAbilities should throw if abilities without executeAbility', () => {
			const ability = {
				name: 'test',
				label: 'Test',
				description: 'Test ability',
			};

			expect( () => {
				useClientToolsWithAbilities( {
					abilities: [ ability ],
				} );
			} ).toThrow( 'executeAbility is required' );
		} );
	} );
} );
