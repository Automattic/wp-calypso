/**
 * Tests for WordPress Abilities API integration
 */

import { describe, expect, it } from 'vitest';
import {
	convertAbilitiesToTools,
	convertAbilityToTool,
	isWordPressAbility,
} from '../wordpressAbilities';
import type { Ability, Tool } from '../../client/types';

describe( 'WordPress Abilities Integration', () => {
	// Sample ability for testing
	const sampleAbility: Ability = {
		name: 'test-plugin/sample-ability',
		label: 'Sample Ability',
		description: 'A sample ability for testing',
		input_schema: {
			type: 'object',
			properties: {
				input: { type: 'string' },
			},
			required: [ 'input' ],
		},
		output_schema: {
			type: 'object',
			properties: {
				result: { type: 'string' },
			},
		},
		meta: {
			type: 'tool',
		},
	};

	const clientAbility: Ability = {
		name: 'test-plugin/client-ability',
		label: 'Client Ability',
		description: 'A client-side ability',
		callback: async ( input ) => ( {
			result: `Processed: ${ input.value }`,
		} ),
		permissionCallback: async () => true,
	};

	describe( 'convertAbilityToTool', () => {
		it( 'should convert an ability to a tool', () => {
			const tool = convertAbilityToTool( sampleAbility );

			// Tool ID should sanitize "/" to "-" for compatibility
			expect( tool.id ).toBe( 'test-plugin-sample-ability' );
			expect( tool.name ).toBe( 'Sample Ability' );
			expect( tool.description ).toBe( 'A sample ability for testing' );
			expect( tool.input_schema ).toEqual( sampleAbility.input_schema );
			expect( ( tool as any )._source ).toBe( 'wordpress-ability' );
			expect( ( tool as any )._originalAbility ).toBe( sampleAbility );
		} );

		it( 'should provide default input_schema if not present', () => {
			const abilityWithoutSchema: Ability = {
				name: 'test/no-schema',
				label: 'No Schema',
				description: 'Ability without schema',
			};

			const tool = convertAbilityToTool( abilityWithoutSchema );

			expect( tool.input_schema ).toEqual( {
				type: 'object',
				properties: {},
			} );
		} );
	} );

	describe( 'convertAbilitiesToTools', () => {
		it( 'should convert multiple abilities to tools', () => {
			const abilities = [ sampleAbility, clientAbility ];
			const tools = convertAbilitiesToTools( abilities );

			expect( tools ).toHaveLength( 2 );
			// Tool IDs should sanitize "/" to "-" for compatibility
			expect( tools[ 0 ].id ).toBe( 'test-plugin-sample-ability' );
			expect( tools[ 1 ].id ).toBe( 'test-plugin-client-ability' );
		} );

		it( 'should handle empty array', () => {
			const tools = convertAbilitiesToTools( [] );
			expect( tools ).toEqual( [] );
		} );
	} );

	describe( 'isWordPressAbility', () => {
		it( 'should identify converted abilities', () => {
			const tool = convertAbilityToTool( sampleAbility );
			expect( isWordPressAbility( tool ) ).toBe( true );
		} );

		it( 'should not identify regular tools', () => {
			const regularTool: Tool = {
				id: 'regular-tool',
				name: 'Regular Tool',
				description: 'A regular tool',
				input_schema: {
					type: 'object',
					properties: {},
				},
			};

			expect( isWordPressAbility( regularTool ) ).toBe( false );
		} );

		it( 'should handle null/undefined', () => {
			expect( isWordPressAbility( null ) ).toBe( false );
			expect( isWordPressAbility( undefined ) ).toBe( false );
		} );
	} );
} );
