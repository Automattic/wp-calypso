import {
	abilityMatchesClaim,
	findAbilityClaimant,
	findComponentClaimant,
	normalizeAbilityName,
	resolveEffectiveAgentId,
	resolveProviderComposition,
} from '../provider-composition';

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

describe( 'normalizeAbilityName', () => {
	it( 'converts slashes and hyphens the way AM routes tool calls', () => {
		expect( normalizeAbilityName( 'big-sky/show-component' ) ).toBe( 'big_sky__show_component' );
		expect( normalizeAbilityName( 'jetpack_ai__show_component' ) ).toBe(
			'jetpack_ai__show_component'
		);
	} );
} );

describe( 'abilityMatchesClaim', () => {
	it( 'matches every spelling of an id inside the claimed namespace', () => {
		expect( abilityMatchesClaim( 'big-sky', 'big-sky/show-component' ) ).toBe( true );
		expect( abilityMatchesClaim( 'big-sky', 'big_sky__show_component' ) ).toBe( true );
		expect( abilityMatchesClaim( 'big-sky', 'big-sky-show-component' ) ).toBe( true );
		expect( abilityMatchesClaim( 'jetpack_ai', 'jetpack_ai__show_component' ) ).toBe( true );
		expect( abilityMatchesClaim( 'jetpack_ai', 'jetpack_ai' ) ).toBe( true );
	} );

	it( 'does not bleed into sibling namespaces', () => {
		expect( abilityMatchesClaim( 'jetpack_ai', 'jetpack_ai2__tool' ) ).toBe( false );
		expect( abilityMatchesClaim( 'jetpack_ai', 'jetpack' ) ).toBe( false );
		expect( abilityMatchesClaim( 'big-sky', 'wpcom/update-block-content' ) ).toBe( false );
	} );

	it( 'does not let a short claim swallow a hyphenated sibling namespace', () => {
		expect( abilityMatchesClaim( 'wpcom', 'wpcom-workflow/run' ) ).toBe( false );
		expect( abilityMatchesClaim( 'foo', 'foo-bar/baz' ) ).toBe( false );
	} );
} );

describe( 'resolveEffectiveAgentId', () => {
	afterEach( () => {
		delete ( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData;
	} );

	it( 'prefers a known agent id from the caller', () => {
		expect( resolveEffectiveAgentId( 'wpcom-workflow-unified_chat' ) ).toBe(
			'wpcom-workflow-unified_chat'
		);
	} );

	it( 'falls back to inline data, then the orchestrator default', () => {
		expect( resolveEffectiveAgentId() ).toBe( 'wp-orchestrator' );

		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData = {
			agentId: 'woo-assistant',
		};
		expect( resolveEffectiveAgentId() ).toBe( 'woo-assistant' );
	} );
} );

describe( 'resolveProviderComposition', () => {
	it( 'synthesises host manifests for providers without one', () => {
		const policy = resolveProviderComposition( [ {}, {} ], 'wp-orchestrator' );

		expect( policy.providers ).toHaveLength( 2 );
		expect( policy.providers.every( ( entry ) => entry.manifest.role === 'host' ) ).toBe( true );
		expect( policy.providers.map( ( entry ) => entry.manifest.providerId ) ).toEqual( [
			'provider-0',
			'provider-1',
		] );
		expect( policy.guests ).toHaveLength( 0 );
		expect( policy.notices ).toHaveLength( 0 );
	} );

	it( 'treats an unknown role as a malformed manifest', () => {
		const policy = resolveProviderComposition(
			[ {}, { compositionManifest: { ...jetpackManifest, role: 'overlay' } } ],
			'wp-orchestrator'
		);

		expect( policy.guests ).toHaveLength( 0 );
		expect( policy.providers[ 1 ].manifest.role ).toBe( 'host' );
		expect( policy.notices ).toEqual( [
			'[AgentsManager] Provider 1 exported a malformed compositionManifest; treating it as a host.',
		] );
	} );

	it( 'skips null modules without disturbing provider indexes', () => {
		const policy = resolveProviderComposition(
			[ null, {}, { compositionManifest: jetpackManifest } ],
			'wp-orchestrator'
		);

		expect( policy.providers.map( ( entry ) => entry.providerIndex ) ).toEqual( [ 1, 2 ] );
		expect( policy.guests[ 0 ].providerIndex ).toBe( 2 );
	} );

	it( 'drops a guest that does not support the active agent', () => {
		const policy = resolveProviderComposition(
			[ {}, { compositionManifest: jetpackManifest } ],
			'reader-chat'
		);

		expect( policy.providers ).toHaveLength( 1 );
		expect( policy.guests ).toHaveLength( 0 );
		expect( policy.notices ).toEqual( [
			'[AgentsManager] Guest provider "jetpack-ai-sidebar" does not support agent "reader-chat"; provider skipped.',
		] );
	} );

	it( 'keeps a guest without supportedAgentIds for every agent', () => {
		const policy = resolveProviderComposition(
			[
				{},
				{
					compositionManifest: {
						providerId: 'anywhere-guest',
						role: 'guest',
						claims: { abilities: [ 'anywhere' ] },
					},
				},
			],
			'reader-chat'
		);

		expect( policy.guests ).toHaveLength( 1 );
	} );

	it( 'drops the later guest on overlapping ability claims', () => {
		const policy = resolveProviderComposition(
			[
				{},
				{ compositionManifest: jetpackManifest },
				{
					compositionManifest: {
						providerId: 'imposter',
						role: 'guest',
						claims: { abilities: [ 'jetpack_ai' ] },
					},
				},
			],
			'wp-orchestrator'
		);

		expect( policy.guests.map( ( guest ) => guest.manifest.providerId ) ).toEqual( [
			'jetpack-ai-sidebar',
		] );
		expect( policy.providers.map( ( entry ) => entry.providerIndex ) ).toEqual( [ 0, 1 ] );
		expect( policy.notices ).toEqual( [
			'[AgentsManager] Guest provider "imposter" claims ability namespace "jetpack_ai" already claimed by "jetpack-ai-sidebar"; provider skipped.',
		] );
	} );

	it( 'treats remaining guests as a host pool when no host is present', () => {
		const policy = resolveProviderComposition(
			[ { compositionManifest: jetpackManifest } ],
			'wp-orchestrator'
		);

		expect( policy.providers ).toHaveLength( 1 );
		expect( policy.providers[ 0 ].manifest.role ).toBe( 'host' );
		expect( policy.guests ).toHaveLength( 0 );
		// A lone guest is the routine guest-only surface; no notice.
		expect( policy.notices ).toHaveLength( 0 );
	} );

	it( 'notes the host-pool coercion when several guests load with no host', () => {
		const policy = resolveProviderComposition(
			[
				{ compositionManifest: jetpackManifest },
				{
					compositionManifest: {
						providerId: 'other-guest',
						role: 'guest',
						claims: { abilities: [ 'other' ] },
					},
				},
			],
			'wp-orchestrator'
		);

		expect( policy.providers.every( ( entry ) => entry.manifest.role === 'host' ) ).toBe( true );
		expect( policy.notices ).toEqual( [
			'[AgentsManager] No host provider present; treating 2 guest providers as hosts with the legacy merge.',
		] );
	} );

	it( 'does not treat hyphenated sibling namespaces as conflicting claims', () => {
		const policy = resolveProviderComposition(
			[
				{},
				{
					compositionManifest: {
						providerId: 'wpcom-guest',
						role: 'guest',
						claims: { abilities: [ 'wpcom' ] },
					},
				},
				{
					compositionManifest: {
						providerId: 'wpcom-workflow-guest',
						role: 'guest',
						claims: { abilities: [ 'wpcom-workflow' ] },
					},
				},
			],
			'wp-orchestrator'
		);

		expect( policy.guests ).toHaveLength( 2 );
		expect( policy.notices ).toHaveLength( 0 );
	} );

	it( 'treats a malformed manifest as a host, loudly', () => {
		const policy = resolveProviderComposition(
			[ { compositionManifest: { role: 'guest' } } ],
			'wp-orchestrator'
		);

		expect( policy.providers[ 0 ].manifest.role ).toBe( 'host' );
		expect( policy.providers[ 0 ].manifest.providerId ).toBe( 'provider-0' );
		expect( policy.notices ).toEqual( [
			'[AgentsManager] Provider 0 exported a malformed compositionManifest; treating it as a host.',
		] );
	} );
} );

describe( 'findAbilityClaimant / findComponentClaimant', () => {
	const guests = resolveProviderComposition(
		[ {}, { compositionManifest: jetpackManifest } ],
		'wp-orchestrator'
	).guests;

	it( 'finds the guest owning a claimed ability in any spelling', () => {
		expect( findAbilityClaimant( guests, 'jetpack_ai__show_component' )?.providerIndex ).toBe( 1 );
		expect( findAbilityClaimant( guests, 'jetpack-ai/show-component' )?.providerIndex ).toBe( 1 );
		expect( findAbilityClaimant( guests, 'big-sky/show-component' ) ).toBeUndefined();
	} );

	it( 'finds the guest owning a claimed component type', () => {
		expect( findComponentClaimant( guests, 'title-picker' )?.providerIndex ).toBe( 1 );
		expect( findComponentClaimant( guests, 'color-picker' ) ).toBeUndefined();
	} );

	it( 'prefers the longest matching namespace for hyphen-flattened spellings', () => {
		const policy = resolveProviderComposition(
			[
				{},
				{
					compositionManifest: {
						providerId: 'jetpack-ai',
						role: 'guest',
						claims: { abilities: [ 'jetpack_ai' ] },
					},
				},
				{
					compositionManifest: {
						providerId: 'jetpack-ai-extras',
						role: 'guest',
						claims: { abilities: [ 'jetpack_ai_extras' ] },
					},
				},
			],
			'wp-orchestrator'
		);

		// `jetpack-ai-extras-tool` flattens `/` to `-`, so both namespaces
		// match under the single-underscore fallback; the longer one owns it.
		expect(
			findAbilityClaimant( policy.guests, 'jetpack-ai-extras-tool' )?.manifest.providerId
		).toBe( 'jetpack-ai-extras' );
	} );
} );
