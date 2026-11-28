/* eslint-disable import/order */
import { vi } from 'vitest';
import type { AttachmentRecord } from '../types/wordpress.d';

const mockRegisterAbility = vi.fn();
const mockRegisterAbilityCategory = vi.fn();
const mockUpdateImageStudioCanvas = vi.fn().mockResolvedValue( undefined );
const mockSetDraftIds = vi.fn();
const mockTrackRevisionNavigated = vi.fn();
const mockTrackImageGenerated = vi.fn();

const attachments: Record< number, AttachmentRecord > = {
	10: { id: 10, source_url: 'https://example.com/10.png', date: '2026-01-01T10:00:00' },
	11: { id: 11, source_url: 'https://example.com/11.png', date: '2026-01-01T11:00:00' },
	12: { id: 12, source_url: 'https://example.com/12.png', date: '2026-01-01T12:00:00' },
};

let state: {
	originalAttachmentId: number | null;
	currentAttachmentId: number | null;
	draftIds: number[];
};

vi.mock( '@wordpress/abilities', () => ( {
	registerAbility: ( ...args: unknown[] ) => mockRegisterAbility( ...args ),
	registerAbilityCategory: ( ...args: unknown[] ) => mockRegisterAbilityCategory( ...args ),
} ) );

vi.mock( '@wordpress/data', () => ( {
	dispatch: () => ( {
		updateImageStudioCanvas: mockUpdateImageStudioCanvas,
		setDraftIds: mockSetDraftIds,
	} ),
	select: ( store: unknown ) => {
		if ( ( store as { name?: string } )?.name === 'core' ) {
			return {
				getEntityRecord: ( _kind: string, _name: string, id: number ) => attachments[ id ],
			};
		}
		return {
			getOriginalAttachmentId: () => state.originalAttachmentId,
			getImageStudioAttachmentId: () => state.currentAttachmentId,
			getDraftIds: () => state.draftIds,
			getSavedAttachmentIds: () => [],
			getAnnotatedAttachmentIds: () => [],
		};
	},
} ) );

vi.mock( '../store', () => ( { store: 'image-studio' } ) );

vi.mock( '../utils/tracking', () => ( {
	trackImageStudioRevisionNavigated: ( ...args: unknown[] ) =>
		mockTrackRevisionNavigated( ...args ),
	trackImageStudioImageGenerated: ( ...args: unknown[] ) => mockTrackImageGenerated( ...args ),
} ) );

type AbilityCallback = ( input: unknown ) => Promise< unknown >;

async function getCallback(): Promise< AbilityCallback > {
	const { registerNavigateRevisionAbility } = await import( './navigate-revision' );
	await registerNavigateRevisionAbility();
	const lastCall = mockRegisterAbility.mock.calls.at( -1 );
	if ( ! lastCall ) {
		throw new Error( 'registerAbility was not called' );
	}
	return ( lastCall[ 0 ] as { callback: AbilityCallback } ).callback;
}

describe( 'registerNavigateRevisionAbility', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		vi.resetModules();
		mockRegisterAbility.mockResolvedValue( undefined );
		state = { originalAttachmentId: 10, currentAttachmentId: 11, draftIds: [ 11, 12 ] };
	} );

	it( 'registers the ability with a required direction enum', async () => {
		await getCallback();

		expect( mockRegisterAbilityCategory ).not.toHaveBeenCalled();
		const config = mockRegisterAbility.mock.calls[ 0 ][ 0 ];
		expect( config.name ).toBe( 'image-studio/navigate-revision' );
		expect( config.category ).toBe( 'image-studio' );
		expect( config.input_schema.required ).toEqual( [ 'direction' ] );
		expect( config.input_schema.properties.direction.enum ).toEqual( [
			'previous',
			'next',
			'original',
		] );
	} );

	it( 'is idempotent and treats its own "already registered" error as success', async () => {
		mockRegisterAbility.mockRejectedValueOnce(
			new Error( 'Ability "image-studio/navigate-revision" is already registered' )
		);
		const { registerNavigateRevisionAbility } = await import( './navigate-revision' );

		await expect( registerNavigateRevisionAbility() ).resolves.toBeUndefined();
		await registerNavigateRevisionAbility();
		expect( mockRegisterAbility ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'goes back to the previous version', async () => {
		const callback = await getCallback();

		await expect( callback( { direction: 'previous' } ) ).resolves.toEqual( {
			success: true,
			message: 'Went back to the previous version.',
			position: 1,
			count: 3,
		} );
		expect( mockUpdateImageStudioCanvas ).toHaveBeenCalledWith(
			'https://example.com/10.png',
			10,
			false
		);
		expect( mockTrackRevisionNavigated ).toHaveBeenCalledWith( {
			direction: 'previous',
			source: 'prompt',
		} );
	} );

	it( 'goes forward to the next version', async () => {
		const callback = await getCallback();

		await expect( callback( { direction: 'next' } ) ).resolves.toEqual( {
			success: true,
			message: 'Went forward to the next version.',
			position: 3,
			count: 3,
		} );
		expect( mockUpdateImageStudioCanvas ).toHaveBeenCalledWith(
			'https://example.com/12.png',
			12,
			false
		);
		expect( mockTrackRevisionNavigated ).toHaveBeenCalledWith( {
			direction: 'next',
			source: 'prompt',
		} );
	} );

	it( 'goes back to the original version and keeps the drafts', async () => {
		state.currentAttachmentId = 12;
		const callback = await getCallback();

		await expect( callback( { direction: 'original' } ) ).resolves.toEqual( {
			success: true,
			message: 'Went back to the original version.',
			position: 1,
			count: 3,
		} );
		expect( mockUpdateImageStudioCanvas ).toHaveBeenCalledWith(
			'https://example.com/10.png',
			10,
			false
		);
		expect( mockTrackRevisionNavigated ).toHaveBeenCalledWith( {
			direction: 'original',
			source: 'prompt',
		} );
	} );

	it( 'treats the oldest version as the original when there is no original attachment', async () => {
		state = { originalAttachmentId: null, currentAttachmentId: 12, draftIds: [ 11, 12 ] };
		const callback = await getCallback();

		await expect( callback( { direction: 'original' } ) ).resolves.toEqual( {
			success: true,
			message: 'Went back to the original version.',
			position: 1,
			count: 2,
		} );
		expect( mockUpdateImageStudioCanvas ).toHaveBeenCalledWith(
			'https://example.com/11.png',
			11,
			false
		);
	} );

	it.each( [
		[ 'previous', 10, 'This is already the first version.', 1 ],
		[ 'next', 12, 'This is already the latest version.', 3 ],
		[ 'original', 10, 'This is already the original version.', 1 ],
	] )(
		'leaves the canvas alone for %s at the end of the history',
		async ( direction, currentAttachmentId, message, position ) => {
			state.currentAttachmentId = currentAttachmentId;
			const callback = await getCallback();

			await expect( callback( { direction } ) ).resolves.toEqual( {
				success: true,
				message,
				position,
				count: 3,
			} );
			expect( mockUpdateImageStudioCanvas ).not.toHaveBeenCalled();
			expect( mockTrackRevisionNavigated ).not.toHaveBeenCalled();
		}
	);

	it( 'leaves the canvas alone when there is only one version', async () => {
		state = { originalAttachmentId: 10, currentAttachmentId: 10, draftIds: [] };
		const callback = await getCallback();

		await expect( callback( { direction: 'previous' } ) ).resolves.toEqual( {
			success: true,
			message: 'There are no other versions of this image yet.',
			position: 1,
			count: 1,
		} );
		expect( mockUpdateImageStudioCanvas ).not.toHaveBeenCalled();
	} );

	it( 'goes to the original from an image that is not in the history', async () => {
		state.currentAttachmentId = 99;
		const callback = await getCallback();

		await expect( callback( { direction: 'original' } ) ).resolves.toEqual( {
			success: true,
			message: 'Went back to the original version.',
			position: 1,
			count: 3,
		} );
		expect( mockUpdateImageStudioCanvas ).toHaveBeenCalledWith(
			'https://example.com/10.png',
			10,
			false
		);
		expect( mockTrackRevisionNavigated ).toHaveBeenCalledWith( {
			direction: 'original',
			source: 'prompt',
		} );
	} );

	it( 'goes to the first version on next from an image that is not in the history', async () => {
		state = { originalAttachmentId: 99, currentAttachmentId: 98, draftIds: [ 11, 12 ] };
		const callback = await getCallback();

		await expect( callback( { direction: 'next' } ) ).resolves.toEqual( {
			success: true,
			message: 'Went to the first version in the history.',
			position: 1,
			count: 2,
		} );
		expect( mockUpdateImageStudioCanvas ).toHaveBeenCalledWith(
			'https://example.com/11.png',
			11,
			false
		);
		expect( mockTrackRevisionNavigated ).toHaveBeenCalledWith( {
			direction: 'next',
			source: 'prompt',
		} );
	} );

	it( 'leaves the canvas alone on previous from an image that is not in the history', async () => {
		state.currentAttachmentId = 99;
		const callback = await getCallback();

		await expect( callback( { direction: 'previous' } ) ).resolves.toEqual( {
			success: true,
			message:
				'The image on the canvas is not part of the version history, so there is no previous version to go back to.',
			position: 0,
			count: 3,
		} );
		expect( mockUpdateImageStudioCanvas ).not.toHaveBeenCalled();
		expect( mockTrackRevisionNavigated ).not.toHaveBeenCalled();
	} );

	it( 'rejects an unknown direction', async () => {
		const callback = await getCallback();

		await expect( callback( { direction: 'sideways' } ) ).rejects.toThrow( /direction/ );
		await expect( callback( {} ) ).rejects.toThrow( /direction/ );
		expect( mockUpdateImageStudioCanvas ).not.toHaveBeenCalled();
	} );

	it( 'never changes the drafts or tracks a generated image', async () => {
		const callback = await getCallback();

		await callback( { direction: 'previous' } );
		await callback( { direction: 'next' } );
		await callback( { direction: 'original' } );

		expect( mockUpdateImageStudioCanvas ).toHaveBeenCalled();
		expect( mockSetDraftIds ).not.toHaveBeenCalled();
		expect( mockTrackImageGenerated ).not.toHaveBeenCalled();
	} );
} );
