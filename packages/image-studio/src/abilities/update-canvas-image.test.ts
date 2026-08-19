/**
 * Tests for the update-canvas-image ability.
 */

const mockRegisterAbility = jest.fn();
const mockRegisterAbilityCategory = jest.fn();
const mockUpdateImageStudioCanvas = jest.fn().mockResolvedValue( undefined );
const mockSetDraftIds = jest.fn().mockResolvedValue( undefined );
const mockInvalidateResolution = jest.fn();
const mockGetEntityRecord = jest.fn().mockResolvedValue( undefined );
const mockGetAgentsManagerInlineData = jest.fn();

const mockDispatch = jest.fn( ( store?: { name?: string } | string ) => {
	if ( store === 'core' ) {
		return { invalidateResolution: mockInvalidateResolution };
	}

	return {
		updateImageStudioCanvas: mockUpdateImageStudioCanvas,
		setDraftIds: mockSetDraftIds,
		setHasUpdatedMetadata: jest.fn(),
		setCanvasMetadata: jest.fn(),
		addNotice: jest.fn(),
	};
} );

const mockSelect = jest.fn( ( store?: { name?: string } | string ) => {
	if ( store === 'core' ) {
		return {};
	}

	return {
		getCanvasMetadata: () => ( {} ),
		getDraftIds: () => [],
		getOriginalAttachmentId: () => null,
	};
} );

jest.mock( '@wordpress/abilities', () => ( {
	registerAbility: ( ...args: unknown[] ) => mockRegisterAbility( ...args ),
	registerAbilityCategory: ( ...args: unknown[] ) => mockRegisterAbilityCategory( ...args ),
} ) );

jest.mock( '@automattic/agents-manager', () => ( {
	getAgentsManagerInlineData: () => mockGetAgentsManagerInlineData(),
} ) );

jest.mock( '@wordpress/core-data', () => ( {
	store: 'core',
} ) );

jest.mock( '@wordpress/data', () => ( {
	createReduxStore: jest.fn( ( storeName: string, config: Record< string, unknown > ) => ( {
		name: storeName,
		...config,
	} ) ),
	dispatch: ( ...args: unknown[] ) => mockDispatch( ...args ),
	register: jest.fn(),
	resolveSelect: () => ( { getEntityRecord: mockGetEntityRecord } ),
	select: ( ...args: unknown[] ) => mockSelect( ...args ),
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioError: jest.fn(),
	trackImageStudioImageGenerated: jest.fn(),
} ) );

type AbilityCallback = ( input: unknown ) => Promise< unknown >;

describe( 'registerUpdateCanvasImageAbility', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockRegisterAbilityCategory.mockResolvedValue( undefined );
		mockRegisterAbility.mockResolvedValue( undefined );
		jest.resetModules();
	} );

	it.each( [
		{
			label: 'connected self-hosted',
			inlineData: { isWpcomPlatform: false },
			expectedReturnToAgent: false,
		},
		{
			label: 'hosted',
			inlineData: { isWpcomPlatform: true },
			expectedReturnToAgent: undefined,
		},
		{ label: 'unknown', inlineData: undefined, expectedReturnToAgent: undefined },
	] )(
		'$label returns returnToAgent $expectedReturnToAgent',
		async ( { inlineData, expectedReturnToAgent } ) => {
			mockGetAgentsManagerInlineData.mockReturnValue( inlineData );

			const { registerUpdateCanvasImageAbility } = await import( './update-canvas-image' );
			await registerUpdateCanvasImageAbility();

			const config = mockRegisterAbility.mock.calls[ 0 ][ 0 ] as { callback: AbilityCallback };
			const result = await config.callback( { attachmentId: 42 } );

			expect( mockUpdateImageStudioCanvas ).toHaveBeenCalledWith( '', 42, false );
			expect( result ).toEqual( {
				success: true,
				message: 'Canvas image updated successfully.',
				...( expectedReturnToAgent === false && { returnToAgent: false } ),
			} );
		}
	);
} );
