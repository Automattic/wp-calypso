import { WEBMCP_SERVER_ABILITY_NAMES } from '../contracts';
import {
	getAbilityProvenance,
	getWebMcpChannelExposure,
	shouldExposeWebMcpAbility,
} from '../exposure';
import type { Ability } from '../../abilities/types';

const createClientAbility = ( overrides: Partial< Ability > = {} ): Ability => ( {
	name: 'big-sky/apply-block-edits',
	label: 'Apply block edits',
	description: 'Apply deterministic edits to the current block canvas.',
	category: 'big-sky',
	input_schema: { type: 'object', properties: {} },
	meta: { annotations: { clientRegistered: true, readonly: false } },
	...overrides,
} );

const createServerAbility = ( name: string, overrides: Partial< Ability > = {} ): Ability => ( {
	name,
	label: name,
	description: `Description for ${ name }`,
	category: 'wpcom',
	input_schema: { type: 'object', properties: {} },
	meta: { annotations: { serverRegistered: true, readonly: true, idempotent: true } },
	...overrides,
} );

describe( 'WebMCP exposure', () => {
	describe( 'getWebMcpChannelExposure', () => {
		it( 'reads the explicit channel flag and fails closed on malformed meta', () => {
			expect( getWebMcpChannelExposure( createClientAbility() ) ).toBe( 'unset' );
			expect( getWebMcpChannelExposure( createClientAbility( { meta: { webmcp: null } } ) ) ).toBe(
				'unset'
			);
			expect(
				getWebMcpChannelExposure(
					createClientAbility( { meta: { webmcp: { risk: 'reversible' } } } )
				)
			).toBe( 'unset' );
			expect(
				getWebMcpChannelExposure( createClientAbility( { meta: { webmcp: { public: true } } } ) )
			).toBe( 'public' );
			expect(
				getWebMcpChannelExposure( createClientAbility( { meta: { webmcp: { public: false } } } ) )
			).toBe( 'private' );
			expect( getWebMcpChannelExposure( createClientAbility( { meta: { webmcp: 'yes' } } ) ) ).toBe(
				'private'
			);
			expect(
				getWebMcpChannelExposure( createClientAbility( { meta: { webmcp: [ 'public' ] } } ) )
			).toBe( 'private' );
		} );
	} );

	describe( 'getAbilityProvenance', () => {
		it( 'prefers server provenance and accepts a callback as client evidence', () => {
			expect( getAbilityProvenance( createServerAbility( 'wpcom/get-posts' ) ) ).toBe( 'server' );
			expect(
				getAbilityProvenance(
					createClientAbility( {
						meta: { annotations: { serverRegistered: true, clientRegistered: true } },
					} )
				)
			).toBe( 'server' );
			expect( getAbilityProvenance( createClientAbility() ) ).toBe( 'client' );
			expect(
				getAbilityProvenance( createClientAbility( { meta: undefined, callback: jest.fn() } ) )
			).toBe( 'client' );
			expect(
				getAbilityProvenance( createClientAbility( { meta: { annotations: {} } } ) )
			).toBeUndefined();
		} );
	} );

	describe( 'shouldExposeWebMcpAbility', () => {
		it( 'lets the channel flag opt any known ability in or out', () => {
			expect(
				shouldExposeWebMcpAbility(
					createClientAbility( {
						name: 'other-plugin/publish-post',
						meta: { webmcp: { public: true }, annotations: { clientRegistered: true } },
					} )
				)
			).toBe( true );
			expect(
				shouldExposeWebMcpAbility(
					createServerAbility( 'other-plugin/delete-comment', {
						meta: {
							webmcp: { public: true },
							annotations: { serverRegistered: true, readonly: false },
						},
					} )
				)
			).toBe( true );
			expect(
				shouldExposeWebMcpAbility(
					createClientAbility( {
						meta: { webmcp: { public: false }, annotations: { clientRegistered: true } },
					} )
				)
			).toBe( false );
			expect(
				shouldExposeWebMcpAbility(
					createServerAbility( 'wpcom/get-posts', {
						meta: {
							webmcp: { public: false },
							public: true,
							annotations: { serverRegistered: true, readonly: true },
						},
					} )
				)
			).toBe( false );
			expect(
				shouldExposeWebMcpAbility(
					createClientAbility( {
						meta: { webmcp: 'public', annotations: { clientRegistered: true } },
					} )
				)
			).toBe( false );
		} );

		it( 'lets the generic public flag opt in read-only abilities only', () => {
			expect(
				shouldExposeWebMcpAbility(
					createClientAbility( {
						name: 'other-plugin/get-panel-state',
						meta: { public: true, annotations: { clientRegistered: true, readonly: true } },
					} )
				)
			).toBe( true );
			expect(
				shouldExposeWebMcpAbility(
					createServerAbility( 'other-plugin/get-site-health', {
						meta: { public: true, annotations: { serverRegistered: true, readonly: true } },
					} )
				)
			).toBe( true );
			expect(
				shouldExposeWebMcpAbility(
					createClientAbility( {
						name: 'other-plugin/set-panel-tone',
						meta: { public: true, annotations: { clientRegistered: true, readonly: false } },
					} )
				)
			).toBe( false );
			expect(
				shouldExposeWebMcpAbility(
					createServerAbility( 'other-plugin/publish-post', {
						meta: { public: true, annotations: { serverRegistered: true, readonly: false } },
					} )
				)
			).toBe( false );
		} );

		it( 'does not treat the stored public default as an opt-out', () => {
			expect(
				shouldExposeWebMcpAbility(
					createServerAbility( 'wpcom/get-posts', {
						meta: { public: false, annotations: { serverRegistered: true, readonly: true } },
					} )
				)
			).toBe( true );
			expect(
				shouldExposeWebMcpAbility(
					createServerAbility( 'wpcom/media-create', {
						meta: { public: true, annotations: { serverRegistered: true, readonly: false } },
					} )
				)
			).toBe( true );
		} );

		it( 'requires a known provenance even when a flag opts in', () => {
			expect(
				shouldExposeWebMcpAbility(
					createClientAbility( {
						meta: { webmcp: { public: true }, public: true, annotations: {} },
						callback: undefined,
					} )
				)
			).toBe( false );
		} );

		it( 'falls back to the allowlists with matching provenance', () => {
			expect( shouldExposeWebMcpAbility( createClientAbility() ) ).toBe( true );
			expect(
				shouldExposeWebMcpAbility(
					createClientAbility( { name: 'agents-manager/get-block-tree' } )
				)
			).toBe( true );
			expect(
				shouldExposeWebMcpAbility( createClientAbility( { name: 'big-sky/show-template' } ) )
			).toBe( true );
			expect(
				shouldExposeWebMcpAbility( createClientAbility( { meta: undefined, callback: jest.fn() } ) )
			).toBe( true );
			for ( const name of WEBMCP_SERVER_ABILITY_NAMES ) {
				expect( shouldExposeWebMcpAbility( createServerAbility( name ) ) ).toBe( true );
			}
			expect(
				shouldExposeWebMcpAbility( createClientAbility( { name: 'big-sky/save-post' } ) )
			).toBe( false );
			expect(
				shouldExposeWebMcpAbility(
					createClientAbility( {
						meta: { annotations: { serverRegistered: true, clientRegistered: true } },
					} )
				)
			).toBe( false );
			expect( shouldExposeWebMcpAbility( createServerAbility( 'wpcom/delete-site' ) ) ).toBe(
				false
			);
			expect(
				shouldExposeWebMcpAbility(
					createServerAbility( 'wpcom/get-posts', {
						meta: { annotations: { clientRegistered: true } },
					} )
				)
			).toBe( false );
			expect(
				shouldExposeWebMcpAbility(
					createServerAbility( 'wpcom/get-posts', {
						meta: { annotations: { serverRegistered: true, readonly: false } },
					} )
				)
			).toBe( false );
			expect(
				shouldExposeWebMcpAbility(
					createServerAbility( 'wpcom/media-create', {
						meta: { annotations: { serverRegistered: true, readonly: false } },
					} )
				)
			).toBe( true );
			expect(
				shouldExposeWebMcpAbility(
					createClientAbility( { meta: { annotations: {} }, callback: undefined } )
				)
			).toBe( false );
		} );
	} );
} );
