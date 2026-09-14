/**
 * @jest-environment jsdom
 */
import { withAbilityCompletionBroadcast } from '../ability-completion-broadcast';
import { ABILITY_COMPLETED_EVENT, type AbilityCompletedDetail } from '../agent-activity-events';
import type { Ability, ToolProvider } from '../../types';

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
	executeAbility: jest.Mock = jest.fn( () => Promise.resolve( { success: true } ) )
): ToolProvider {
	return {
		getAbilities: jest.fn( () => Promise.resolve( abilities ) ),
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
					jest.fn( () => Promise.resolve( { success: true, data: 42 } ) )
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
					jest.fn( () => new Promise( ( resolve ) => ( finish = () => resolve( {} ) ) ) )
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
					jest.fn( () => Promise.resolve( { success: false } ) )
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
					jest.fn( () => Promise.reject( new Error( 'boom' ) ) )
				)
			)!;

			await expect( wrapped.executeAbility( 'x', {} ) ).rejects.toThrow( 'boom' );

			expect( events ).toEqual( [ { name: 'x', ok: false } ] );
			cleanup();
		} );
	} );

	describe( 'the callback path', () => {
		it( 'broadcasts after an ability with its own callback resolves', async () => {
			// agenttic-client calls an ability's callback when it has one and
			// never reaches executeAbility for it, so wrapping that path alone
			// would miss every Big Sky ability.
			const { events, cleanup } = listen();
			const callback = jest.fn( () => Promise.resolve( { success: true } ) );
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
