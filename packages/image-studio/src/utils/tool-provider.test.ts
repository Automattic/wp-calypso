/**
 * Tests for tool provider utilities
 */
import { getAbilities, executeAbility } from '@wordpress/abilities';
import { registerUpdateCanvasImageAbility } from '../abilities';
import {
	ALLOWED_ABILITIES,
	initializeAbilities,
	getFilteredAbilities,
	executeFilteredAbility,
	createToolProvider,
} from './tool-provider';

// Mock WordPress abilities
jest.mock( '@wordpress/abilities', () => ( {
	getAbilities: jest.fn().mockResolvedValue( [] ),
	executeAbility: jest.fn().mockResolvedValue( {} ),
} ) );

// Mock abilities registration
jest.mock( '../abilities', () => ( {
	registerUpdateCanvasImageAbility: jest.fn(),
} ) );

// Mock console methods
const consoleLogSpy = jest.spyOn( console, 'log' ).mockImplementation( () => {} );

describe( 'Tool Provider', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		// Don't reset modules for getFilteredAbilities/executeFilteredAbility tests
		// as they need the mocked @wordpress/abilities to work properly
	} );

	afterAll( () => {
		consoleLogSpy.mockRestore();
	} );

	describe( 'ALLOWED_ABILITIES', () => {
		it( 'should define allowed abilities list', () => {
			expect( ALLOWED_ABILITIES ).toEqual( [
				'image-studio/update-canvas-image',
				'image-studio/render-images',
			] );
		} );
	} );

	describe( 'initializeAbilities', () => {
		it( 'should register abilities on first call and not on subsequent calls (idempotency)', async () => {
			await initializeAbilities();

			expect( registerUpdateCanvasImageAbility ).toHaveBeenCalledTimes( 1 );
			expect( consoleLogSpy ).toHaveBeenCalledWith( '[Image Studio] Abilities registered' );

			// Call again - should not register again
			await initializeAbilities();
			await initializeAbilities();

			expect( registerUpdateCanvasImageAbility ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'getFilteredAbilities', () => {
		it( 'should return only allowed abilities', async () => {
			const mockAbilities = [
				{ name: 'image-studio/update-canvas-image', description: 'Update canvas' },
				{ name: 'image-studio/render-images', description: 'Render images' },
				{ name: 'other/ability', description: 'Not allowed' },
				{ name: 'another/ability', description: 'Also not allowed' },
			];

			( getAbilities as jest.Mock ).mockResolvedValue( mockAbilities );

			const filtered = await getFilteredAbilities();

			expect( filtered ).toHaveLength( 2 );
			expect( filtered ).toEqual( [
				{ name: 'image-studio/update-canvas-image', description: 'Update canvas' },
				{ name: 'image-studio/render-images', description: 'Render images' },
			] );
		} );

		it( 'should handle abilities with missing names', async () => {
			const mockAbilities = [
				{ name: 'image-studio/update-canvas-image', description: 'Update canvas' },
				{ description: 'No name' }, // Missing name
				null, // Null ability
				{ name: '', description: 'Empty name' }, // Empty name
			];

			( getAbilities as jest.Mock ).mockResolvedValue( mockAbilities );

			const filtered = await getFilteredAbilities();

			expect( filtered ).toHaveLength( 1 );
			expect( filtered[ 0 ].name ).toBe( 'image-studio/update-canvas-image' );
		} );

		it( 'should log available abilities', async () => {
			const mockAbilities = [
				{ name: 'image-studio/update-canvas-image', description: 'Update canvas' },
				{ name: 'image-studio/render-images', description: 'Render images' },
			];

			( getAbilities as jest.Mock ).mockResolvedValue( mockAbilities );

			await getFilteredAbilities();

			expect( consoleLogSpy ).toHaveBeenCalledWith( '[Image Studio] Available abilities:', [
				'image-studio/update-canvas-image',
				'image-studio/render-images',
			] );
		} );

		it( 'should call getAbilities from WordPress abilities API', async () => {
			const mockAbilities = [
				{ name: 'image-studio/update-canvas-image', description: 'Update canvas' },
			];

			( getAbilities as jest.Mock ).mockResolvedValue( mockAbilities );

			await getFilteredAbilities();

			expect( getAbilities ).toHaveBeenCalled();
		} );
	} );

	describe( 'executeFilteredAbility', () => {
		it( 'should execute allowed ability', async () => {
			const abilityName = 'image-studio/update-canvas-image';
			const abilityArgs = { imageUrl: 'https://example.com/image.jpg' };
			const mockResult = { success: true };

			( executeAbility as jest.Mock ).mockResolvedValue( mockResult );

			const result = await executeFilteredAbility( abilityName, abilityArgs );

			expect( executeAbility ).toHaveBeenCalledWith( abilityName, abilityArgs );
			expect( result ).toEqual( mockResult );
			expect( consoleLogSpy ).toHaveBeenCalledWith(
				'[Image Studio] Executing ability: image-studio/update-canvas-image',
				abilityArgs
			);
		} );

		it( 'should throw error for disallowed ability', async () => {
			const abilityName = 'malicious/ability';
			const abilityArgs = { data: 'test' };

			await expect( executeFilteredAbility( abilityName, abilityArgs ) ).rejects.toThrow(
				"Ability 'malicious/ability' is not allowed for Image Studio"
			);

			expect( executeAbility ).not.toHaveBeenCalled();
		} );

		it( 'should call executeAbility from WordPress abilities API', async () => {
			const abilityName = 'image-studio/render-images';
			const abilityArgs = {};

			( executeAbility as jest.Mock ).mockResolvedValue( {} );

			await executeFilteredAbility( abilityName, abilityArgs );

			expect( executeAbility ).toHaveBeenCalledWith( abilityName, abilityArgs );
		} );

		it( 'should pass through execution errors', async () => {
			const abilityName = 'image-studio/update-canvas-image';
			const executionError = new Error( 'Execution failed' );

			( executeAbility as jest.Mock ).mockRejectedValue( executionError );

			await expect( executeFilteredAbility( abilityName, {} ) ).rejects.toThrow(
				'Execution failed'
			);
		} );
	} );

	describe( 'createToolProvider', () => {
		it( 'should return tool provider with correct interface', () => {
			const toolProvider = createToolProvider();

			expect( toolProvider ).toHaveProperty( 'getAbilities' );
			expect( toolProvider ).toHaveProperty( 'executeAbility' );
			expect( typeof toolProvider.getAbilities ).toBe( 'function' );
			expect( typeof toolProvider.executeAbility ).toBe( 'function' );
		} );

		it( 'should use getFilteredAbilities for getAbilities method', async () => {
			const mockAbilities = [
				{ name: 'image-studio/update-canvas-image', description: 'Update canvas' },
			];

			( getAbilities as jest.Mock ).mockResolvedValue( mockAbilities );

			const toolProvider = createToolProvider();

			const abilities = await toolProvider.getAbilities();

			expect( abilities ).toEqual( mockAbilities );
		} );

		it( 'should use executeFilteredAbility for executeAbility method', async () => {
			const abilityName = 'image-studio/update-canvas-image';
			const abilityArgs = { test: 'data' };
			const mockResult = { success: true };

			( executeAbility as jest.Mock ).mockResolvedValue( mockResult );

			const toolProvider = createToolProvider();

			const result = await toolProvider.executeAbility( abilityName, abilityArgs );

			expect( executeAbility ).toHaveBeenCalledWith( abilityName, abilityArgs );
			expect( result ).toEqual( mockResult );
		} );
	} );
} );
