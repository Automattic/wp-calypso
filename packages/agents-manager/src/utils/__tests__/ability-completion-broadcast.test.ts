/**
 * @jest-environment jsdom
 */
import { type Mock, vi } from 'vitest';
import { withAbilityCompletionBroadcast } from '../ability-completion-broadcast';
import { ABILITY_COMPLETED_EVENT, type AbilityCompletedDetail } from '../agent-activity-events';
import { recordAgentsManagerTracksEvent } from '../tracks';
import type { ToolProvider } from '../../types';
import type { Ability } from '@wordpress/abilities';

vi.mock( '../tracks', () => ( { recordAgentsManagerTracksEvent: vi.fn() } ) );

function listen() {
	const events: AbilityCompletedDetail[] = [];
	const listener = ( event: Event ) => {
		events.push( ( event as CustomEvent< AbilityCompletedDetail > ).detail );
	};
	window.addEventListener( ABILITY_COMPLETED_EVENT, listener );

	return {
		events,
		cleanup: () => window.removeEventListener( ABILITY_COMPLETED_EVENT, listener ),
	};
}

function createToolProvider(
	abilities: Ability[] = [],
	executeAbility: Mock = vi.fn( () => Promise.resolve( { success: true } ) )
): ToolProvider {
	return {
		getAbilities: vi.fn( () => Promise.resolve( abilities ) ),
		executeAbility,
	} as unknown as ToolProvider;
}

describe( 'withAbilityCompletionBroadcast', () => {
	it( 'hands back nothing when there is no provider to wrap', () => {
		expect( withAbilityCompletionBroadcast( undefined ) ).toBeUndefined();
	} );

	describe( 'the executeAbility path', () => {
		it( 'broadcasts after the ability resolves', async () => {
			const { events, cleanup } = listen();
			const wrapped = withAbilityCompletionBroadcast( createToolProvider() )!;

			await wrapped.executeAbility( 'big-sky/apply-block-edits', {} );

			expect( events ).toEqual( [ { name: 'big-sky/apply-block-edits', ok: true } ] );
			cleanup();
		} );

		it( 'returns whatever the ability answered', async () => {
			const { cleanup } = listen();
			const wrapped = withAbilityCompletionBroadcast(
				createToolProvider(
					[],
					vi.fn( () => Promise.resolve( { success: true, data: 42 } ) )
				)
			)!;

			await expect( wrapped.executeAbility( 'x', {} ) ).resolves.toEqual( {
				success: true,
				data: 42,
			} );
			cleanup();
		} );

		it( 'does not broadcast before the ability has finished', async () => {
			// The whole point of the event is that the ability's writes have
			// landed by the time it fires.
			const { events, cleanup } = listen();
			let finish!: () => void;
			const wrapped = withAbilityCompletionBroadcast(
				createToolProvider(
					[],
					vi.fn( () => new Promise( ( resolve ) => ( finish = () => resolve( {} ) ) ) )
				)
			)!;

			const pending = wrapped.executeAbility( 'x', {} );
			expect( events ).toEqual( [] );

			finish();
			await pending;

			expect( events ).toHaveLength( 1 );
			cleanup();
		} );

		it( 'reports an ability that answered failure as not ok', async () => {
			const { events, cleanup } = listen();
			const wrapped = withAbilityCompletionBroadcast(
				createToolProvider(
					[],
					vi.fn( () => Promise.resolve( { success: false } ) )
				)
			)!;

			await wrapped.executeAbility( 'x', {} );

			expect( events ).toEqual( [ { name: 'x', ok: false } ] );
			cleanup();
		} );

		it( 'reports an ability that threw as not ok, and still throws', async () => {
			const { events, cleanup } = listen();
			const wrapped = withAbilityCompletionBroadcast(
				createToolProvider(
					[],
					vi.fn( () => Promise.reject( new Error( 'boom' ) ) )
				)
			)!;

			await expect( wrapped.executeAbility( 'x', {} ) ).rejects.toThrow( 'boom' );

			expect( events ).toEqual( [ { name: 'x', ok: false } ] );
			cleanup();
		} );
	} );

	it( 'records each completion in Tracks, with the outcome', async () => {
		( recordAgentsManagerTracksEvent as Mock ).mockClear();
		const failing = vi.fn( () => Promise.resolve( { success: false } ) );

		await withAbilityCompletionBroadcast( createToolProvider() )!.executeAbility( 'woo/ok', {} );
		await withAbilityCompletionBroadcast( createToolProvider( [], failing ) )!.executeAbility(
			'woo/bad',
			{}
		);

		expect( ( recordAgentsManagerTracksEvent as Mock ).mock.calls ).toEqual( [
			[
				'calypso_agents_manager_ability_completed',
				{ ability_name: 'woo/ok', outcome: 'success' },
			],
			[ 'calypso_agents_manager_ability_completed', { ability_name: 'woo/bad', outcome: 'error' } ],
		] );
	} );

	describe( 'the callback path', () => {
		it( 'broadcasts after an ability with its own callback resolves', async () => {
			// agenttic-client calls an ability's callback when it has one and
			// never reaches executeAbility for it, so wrapping that path alone
			// would miss every Big Sky ability.
			const { events, cleanup } = listen();
			const callback = vi.fn( () => Promise.resolve( { success: true } ) );
			const wrapped = withAbilityCompletionBroadcast(
				createToolProvider( [ { name: 'big-sky/add-pages', callback } as unknown as Ability ] )
			)!;

			const [ ability ] = await wrapped.getAbilities();
			await ability.callback!( { foo: 'bar' } );

			expect( callback ).toHaveBeenCalledWith( { foo: 'bar' } );
			expect( events ).toEqual( [ { name: 'big-sky/add-pages', ok: true } ] );
			cleanup();
		} );

		it( 'leaves an ability without a callback untouched', async () => {
			const { cleanup } = listen();
			const ability = { name: 'no-callback' } as unknown as Ability;
			const wrapped = withAbilityCompletionBroadcast( createToolProvider( [ ability ] ) )!;

			const [ result ] = await wrapped.getAbilities();

			expect( result ).toBe( ability );
			cleanup();
		} );
	} );
} );
