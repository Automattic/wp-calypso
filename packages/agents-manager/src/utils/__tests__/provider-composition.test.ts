import {
	abilityMatchesClaim,
	findAbilityClaimant,
	resolveEffectiveAgentId,
	resolveProviderComposition,
} from '../provider-composition';

type Claims = { abilities?: string[]; components?: string[]; context?: string[] };
type TestModule = { compositionManifest?: unknown };

const jetpackManifest = {
	providerId: 'jetpack-ai-sidebar',
	role: 'guest' as const,
	supportedAgentIds: [ 'wp-orchestrator', 'dolly' ],
	claims: {
		abilities: [ 'jetpack_ai' ],
		components: [ 'title-picker' ],
		context: [ 'titleSuggestionCount' ],
	},
};

const moduleFor = ( compositionManifest?: unknown ): TestModule =>
	compositionManifest === undefined ? {} : { compositionManifest };

const guest = ( providerId: string, claims: Claims, extra: Record< string, unknown > = {} ) =>
	moduleFor( { providerId, role: 'guest', claims, ...extra } );

const resolve = ( modules: Array< TestModule | null >, agentId = 'wp-orchestrator' ) =>
	resolveProviderComposition( modules, agentId );

const providerIds = ( policy: ReturnType< typeof resolve > ) =>
	policy.providers.map( ( entry ) => entry.manifest.providerId );

const guestIds = ( policy: ReturnType< typeof resolve > ) =>
	policy.guests.map( ( entry ) => entry.manifest.providerId );

describe( 'provider composition helpers', () => {
	afterEach( () => {
		delete ( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData;
	} );

	it.each( [
		[ 'big-sky', 'big-sky/show-component', true ],
		[ 'big-sky', 'big_sky__show_component', true ],
		[ 'big-sky', 'big-sky-show-component', true ],
		[ 'jetpack_ai', 'jetpack_ai2__tool', false ],
		[ 'wpcom', 'wpcom-workflow/run', false ],
	] )( 'checks whether %s owns %s', ( claim, ability, expected ) => {
		expect( abilityMatchesClaim( claim, ability ) ).toBe( expected );
	} );

	it( 'uses the caller id, inline id, then the orchestrator default', () => {
		expect( resolveEffectiveAgentId( 'wpcom-workflow-unified_chat' ) ).toBe(
			'wpcom-workflow-unified_chat'
		);
		expect( resolveEffectiveAgentId() ).toBe( 'wp-orchestrator' );

		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData = {
			agentId: 'woo-assistant',
		};
		expect( resolveEffectiveAgentId() ).toBe( 'woo-assistant' );
	} );
} );

describe( 'resolveProviderComposition', () => {
	it( 'normalizes manifests, filters unsupported guests, and keeps ungated guests', () => {
		const policy = resolve(
			[
				null,
				moduleFor(),
				moduleFor( { role: 'guest' } ),
				moduleFor( { providerId: 'bad-role', role: 'overlay' } ),
				moduleFor( jetpackManifest ),
				guest( 'anywhere-guest', { abilities: [ 'anywhere' ] } ),
			],
			'reader-chat'
		);

		expect( providerIds( policy ) ).toEqual( [
			'provider-1',
			'provider-2',
			'provider-3',
			'anywhere-guest',
		] );
		expect( guestIds( policy ) ).toEqual( [ 'anywhere-guest' ] );
		expect( policy.notices ).toEqual( [
			'[AgentsManager] Provider 2 exported a malformed compositionManifest; treating it as a host.',
			'[AgentsManager] Provider 3 exported a malformed compositionManifest; treating it as a host.',
			'[AgentsManager] Guest provider "jetpack-ai-sidebar" does not support agent "reader-chat"; provider skipped.',
		] );
	} );

	it.each( [
		[ { abilities: [ 'jetpack_ai' ] }, 'ability namespace "jetpack_ai"' ],
		[ { components: [ 'title-picker' ] }, 'component type "title-picker"' ],
		[ { context: [ 'titleSuggestionCount' ] }, 'context key "titleSuggestionCount"' ],
	] )( 'drops a later guest with overlapping %s claims', ( claims, conflict ) => {
		const policy = resolve( [
			moduleFor(),
			moduleFor( jetpackManifest ),
			guest( 'imposter', claims ),
		] );

		expect( guestIds( policy ) ).toEqual( [ 'jetpack-ai-sidebar' ] );
		expect( policy.providers.map( ( entry ) => entry.providerIndex ) ).toEqual( [ 0, 1 ] );
		expect( policy.notices ).toEqual( [
			`[AgentsManager] Guest provider "imposter" claims ${ conflict } already claimed by "jetpack-ai-sidebar"; provider skipped.`,
		] );
	} );

	it( 'keeps sibling namespaces independent and picks the longest flattened match', () => {
		const policy = resolve( [
			moduleFor(),
			guest( 'wpcom-guest', { abilities: [ 'wpcom' ] } ),
			guest( 'wpcom-workflow-guest', { abilities: [ 'wpcom-workflow' ] } ),
			guest( 'jetpack-ai', { abilities: [ 'jetpack_ai' ] } ),
			guest( 'jetpack-ai-extras', { abilities: [ 'jetpack_ai_extras' ] } ),
		] );

		expect( policy.guests ).toHaveLength( 4 );
		expect(
			findAbilityClaimant( policy.guests, 'jetpack-ai-extras-tool' )?.manifest.providerId
		).toBe( 'jetpack-ai-extras' );
	} );

	it.each( [
		[ [ moduleFor( jetpackManifest ) ], [] ],
		[
			[ moduleFor( jetpackManifest ), guest( 'other-guest', { abilities: [ 'other' ] } ) ],
			[
				'[AgentsManager] No host provider present; treating 2 guest providers as hosts with the legacy merge.',
			],
		],
	] )( 'treats guest-only surfaces as hosts', ( modules, notices ) => {
		const policy = resolve( modules );

		expect( policy.providers.every( ( entry ) => entry.manifest.role === 'host' ) ).toBe( true );
		expect( policy.guests ).toHaveLength( 0 );
		expect( policy.notices ).toEqual( notices );
	} );
} );

describe( 'claimant lookup', () => {
	const guests = resolve( [ moduleFor(), moduleFor( jetpackManifest ) ] ).guests;

	it( 'finds ability owners from claims', () => {
		expect( findAbilityClaimant( guests, 'jetpack_ai__show_component' )?.providerIndex ).toBe( 1 );
		expect( findAbilityClaimant( guests, 'jetpack-ai/show-component' )?.providerIndex ).toBe( 1 );
		expect( findAbilityClaimant( guests, 'big-sky/show-component' ) ).toBeUndefined();
	} );
} );
