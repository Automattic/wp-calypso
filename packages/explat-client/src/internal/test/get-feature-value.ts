import { createExPlatClient } from '../../create-explat-client';
import { FORCED_FEATURES_STORAGE_KEY } from '../forced-features';
import { polyfilledLocalStorage } from '../local-storage';
import { setBrowserContext } from '../test-common';
import type { Config } from '../../types';

// Canonical contract shape per 00-contracts.md § 6: rule-level `ranges`,
// no inline `range` per variation. `loadFlagPayload` distributes ranges
// onto variations to bridge the canonical payload to the SDK's reader.
const experimentRule = {
	type: 'experiment' as const,
	seed: 'exp_a',
	hash_attribute: 'wpcom_user_id' as const,
	ranges: [ [ 0, 1 ] as [ number, number ] ],
	variations: [
		{ name: 'treatment', value: true, is_default: false, experiment_variation_id: 9002 },
	],
	experiment_id: 12345,
};

function makeClient(
	payload: object | null,
	attributes: Record< string, string > = {}
): { client: ReturnType< typeof createExPlatClient >; config: Config } {
	const config: Config = {
		fetchExperimentAssignment: jest.fn(),
		getAnonId: jest.fn().mockResolvedValue( attributes.anon_id ?? null ),
		fetchFlagPayload: jest.fn().mockResolvedValue( payload ),
		logFeatureAssignment: jest.fn().mockResolvedValue( undefined ),
		getAttributes: jest.fn().mockResolvedValue( attributes ),
		logError: jest.fn(),
		isDevelopmentMode: false,
	};

	return {
		client: createExPlatClient( config ),
		config,
	};
}

function setRuntime( runtime: Record< string, unknown > | undefined ) {
	setBrowserContext();
	if ( runtime ) {
		( global.window as unknown as Record< string, unknown > ).__EXPLAT_RUNTIME__ = runtime;
	}
}

describe( 'getFeatureValue', () => {
	beforeEach( () => {
		jest.restoreAllMocks();
		setBrowserContext();
	} );

	test( 'unknown flag returns default, no beacon', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client, config } = makeClient(
			{ schema_version: 1, flags: {}, ttl: 7200 },
			{ wpcom_user_id: '1' }
		);
		const value = await client.getFeatureValue( 'not_there', 'fallback' );
		expect( value ).toBe( 'fallback' );
		expect( config.logFeatureAssignment ).not.toHaveBeenCalled();
	} );

	test( 'force rule returns value, no beacon', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client, config } = makeClient(
			{
				schema_version: 1,
				flags: {
					kill_in_ru: {
						value_type: 'string',
						default_value: 'on',
						rules: [ { type: 'force', value: 'off', condition: { country: 'RU' } } ],
					},
				},
				ttl: 7200,
			},
			{ country: 'RU' }
		);
		const value = await client.getFeatureValue( 'kill_in_ru', 'unset' );
		expect( value ).toBe( 'off' );
		expect( config.logFeatureAssignment ).not.toHaveBeenCalled();
	} );

	test( 'experiment rule fires beacon when runtime allows logging', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client, config } = makeClient(
			{
				schema_version: 1,
				flags: {
					new_checkout: {
						value_type: 'boolean',
						default_value: false,
						rules: [ experimentRule ],
					},
				},
				ttl: 7200,
			},
			{ wpcom_user_id: '777' }
		);
		const value = await client.getFeatureValue( 'new_checkout', false );
		expect( value ).toBe( true );

		// Allow the fire-and-forget beacon promise to flush.
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( config.logFeatureAssignment ).toHaveBeenCalledWith( {
			flag_key: 'new_checkout',
			experiment_id: 12345,
			experiment_variation_id: 9002,
			hash_attribute: 'wpcom_user_id',
			hash_value: '777',
		} );
	} );

	test( 'missing runtime evaluates but does not log', async () => {
		setRuntime( undefined );
		const { client, config } = makeClient(
			{
				schema_version: 1,
				flags: {
					new_checkout: {
						value_type: 'boolean',
						default_value: false,
						rules: [ experimentRule ],
					},
				},
				ttl: 7200,
			},
			{ wpcom_user_id: '777' }
		);

		const value = await client.getFeatureValue( 'new_checkout', false );
		expect( value ).toBe( true );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		expect( config.logFeatureAssignment ).not.toHaveBeenCalled();
	} );

	test( 'support runtime returns default and does not log', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'support',
			can_evaluate: false,
			can_log_assignment: false,
			can_create_assignment: false,
		} );
		const { client, config } = makeClient(
			{
				schema_version: 1,
				flags: {
					new_checkout: {
						value_type: 'boolean',
						default_value: false,
						rules: [ experimentRule ],
					},
				},
				ttl: 7200,
			},
			{ wpcom_user_id: '777' }
		);

		const value = await client.getFeatureValue( 'new_checkout', 'caller-default' );
		expect( value ).toBe( 'caller-default' );
		expect( config.logFeatureAssignment ).not.toHaveBeenCalled();
	} );

	test.each( [ 'e2e', 'support', 'blocked' ] as const )(
		'%s runtime returns default even if bootstrap booleans are permissive',
		async ( mode ) => {
			setRuntime( {
				schema_version: 1,
				mode,
				can_evaluate: true,
				can_log_assignment: true,
				can_create_assignment: true,
			} );
			const { client, config } = makeClient(
				{
					schema_version: 1,
					flags: {
						new_checkout: {
							value_type: 'boolean',
							default_value: false,
							rules: [ experimentRule ],
						},
					},
					ttl: 7200,
				},
				{ wpcom_user_id: '777' }
			);

			const value = await client.getFeatureValue( 'new_checkout', 'caller-default' );
			expect( value ).toBe( 'caller-default' );
			expect( config.logFeatureAssignment ).not.toHaveBeenCalled();
		}
	);

	test( 'manual_testing runtime may evaluate but never logs', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'manual_testing',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client, config } = makeClient(
			{
				schema_version: 1,
				flags: {
					new_checkout: {
						value_type: 'boolean',
						default_value: false,
						rules: [ experimentRule ],
					},
				},
				ttl: 7200,
			},
			{ wpcom_user_id: '777' }
		);

		const value = await client.getFeatureValue( 'new_checkout', false );
		expect( value ).toBe( true );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		expect( config.logFeatureAssignment ).not.toHaveBeenCalled();
	} );

	test( 'normal runtime does not log when assignment creation is disabled', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: false,
		} );
		const { client, config } = makeClient(
			{
				schema_version: 1,
				flags: {
					new_checkout: {
						value_type: 'boolean',
						default_value: false,
						rules: [ experimentRule ],
					},
				},
				ttl: 7200,
			},
			{ wpcom_user_id: '777' }
		);

		const value = await client.getFeatureValue( 'new_checkout', false );
		expect( value ).toBe( true );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		expect( config.logFeatureAssignment ).not.toHaveBeenCalled();
	} );

	test( 'unknown schema_version returns defaults silently', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client } = makeClient( {
			schema_version: 99,
			flags: {
				whatever: {
					value_type: 'string',
					default_value: 'x',
					rules: [ { type: 'unknown_future' } ],
				},
			},
			ttl: 7200,
		} );
		const value = await client.getFeatureValue( 'whatever', 'safe_default' );
		expect( value ).toBe( 'safe_default' );
	} );

	test( 'logFeatureAssignment failure is non-fatal', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client, config } = makeClient(
			{
				schema_version: 1,
				flags: {
					f: { value_type: 'boolean', default_value: false, rules: [ experimentRule ] },
				},
				ttl: 7200,
			},
			{ wpcom_user_id: '777' }
		);
		( config.logFeatureAssignment as jest.Mock ).mockRejectedValueOnce( new Error( 'network' ) );

		const value = await client.getFeatureValue( 'f', false );
		expect( value ).toBe( true );
	} );

	test( 'fetch failure returns default', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client, config } = makeClient( null, { wpcom_user_id: '1' } );
		( config.fetchFlagPayload as jest.Mock ).mockRejectedValueOnce( new Error( 'boom' ) );
		const value = await client.getFeatureValue( 'anything', 'fallback' );
		expect( value ).toBe( 'fallback' );
	} );

	test( 'concurrent cold-cache calls share a single fetch', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client, config } = makeClient(
			{ schema_version: 1, flags: {}, ttl: 7200 },
			{ wpcom_user_id: '1' }
		);
		await Promise.all( [
			client.getFeatureValue( 'a', 'd' ),
			client.getFeatureValue( 'b', 'd' ),
			client.getFeatureValue( 'c', 'd' ),
		] );
		expect( config.fetchFlagPayload ).toHaveBeenCalledTimes( 1 );
	} );
} );

describe( 'getFeatureValue forced overrides', () => {
	beforeEach( () => {
		jest.restoreAllMocks();
		setBrowserContext();
		polyfilledLocalStorage.removeItem( FORCED_FEATURES_STORAGE_KEY );
	} );

	test( 'returns the forced value before fetching the flag payload', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client, config } = makeClient(
			{ schema_version: 1, flags: {}, ttl: 7200 },
			{ wpcom_user_id: '1' }
		);
		client.devtools.forcedFeatures.set( 'my_flag', 'forced_value' );
		const v = await client.getFeatureValue( 'my_flag', 'control' );
		expect( v ).toBe( 'forced_value' );
		expect( config.fetchFlagPayload ).not.toHaveBeenCalled();
	} );

	test( 'allows forcing a value not present in any experiment definition', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client } = makeClient( { schema_version: 1, flags: {}, ttl: 7200 } );
		client.devtools.forcedFeatures.set( 'my_flag', 'never_defined_in_experiment' );
		const v = await client.getFeatureValue( 'my_flag', 'control' );
		expect( v ).toBe( 'never_defined_in_experiment' );
	} );

	test( 'does NOT POST a feature-assignment beacon for forced values', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client, config } = makeClient(
			{ schema_version: 1, flags: {}, ttl: 7200 },
			{ wpcom_user_id: '1' }
		);
		client.devtools.forcedFeatures.set( 'my_flag', 'treatment' );
		await client.getFeatureValue( 'my_flag', 'control' );
		expect( config.logFeatureAssignment ).not.toHaveBeenCalled();
	} );

	test( 'records an entry in the eval log with source="override"', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client } = makeClient( { schema_version: 1, flags: {}, ttl: 7200 } );
		client.devtools.forcedFeatures.set( 'my_flag', 'treatment' );
		await client.getFeatureValue( 'my_flag', 'control' );
		const entries = client.devtools.evalLog.entries();
		expect( entries[ entries.length - 1 ] ).toMatchObject( {
			flag_key: 'my_flag',
			value: 'treatment',
			source: 'override',
		} );
	} );

	test( 'INVARIANT: no /assignments/log beacon ever fires when a forced override resolves the flag', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		// Payload contains a real experiment rule that *would* trigger the
		// beacon if evaluation reached it. Override must short-circuit before
		// the loader is even called — assertions verify both.
		const payload = {
			schema_version: 1,
			ttl: 7200,
			flags: {
				my_flag: {
					value_type: 'string' as const,
					default_value: 'control',
					rules: [
						{
							type: 'experiment' as const,
							seed: 'my_flag.seed',
							hash_attribute: 'wpcom_user_id' as const,
							experiment_id: 12345,
							variations: [
								{
									name: 'control',
									value: 'control',
									is_default: true,
									experiment_variation_id: 1,
									range: [ 0, 0.5 ] as [ number, number ],
								},
								{
									name: 'treatment',
									value: 'treatment',
									is_default: false,
									experiment_variation_id: 2,
									range: [ 0.5, 1 ] as [ number, number ],
								},
							],
						},
					],
				},
			},
		};
		const { client, config } = makeClient( payload, { wpcom_user_id: '1' } );
		client.devtools.forcedFeatures.set( 'my_flag', 'treatment' );
		await client.getFeatureValue( 'my_flag', 'control' );
		expect( config.logFeatureAssignment ).not.toHaveBeenCalled();
		expect( config.fetchFlagPayload ).not.toHaveBeenCalled();
	} );

	test( 'clearing the override re-evaluates against the payload on the next call', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client } = makeClient( { schema_version: 1, flags: {}, ttl: 7200 } );
		client.devtools.forcedFeatures.set( 'my_flag', 'treatment' );
		const v1 = await client.getFeatureValue( 'my_flag', 'control' );
		expect( v1 ).toBe( 'treatment' );
		client.devtools.forcedFeatures.clear( 'my_flag' );
		const v2 = await client.getFeatureValue( 'my_flag', 'control' );
		expect( v2 ).toBe( 'control' );
	} );
} );

describe( 'devtools.getKnownFlags / getKnownVariations', () => {
	beforeEach( () => {
		jest.restoreAllMocks();
		setBrowserContext();
		polyfilledLocalStorage.removeItem( FORCED_FEATURES_STORAGE_KEY );
	} );

	const samplePayload = {
		schema_version: 1,
		ttl: 7200,
		flags: {
			a: {
				value_type: 'string' as const,
				default_value: 'control',
				rules: [
					{
						type: 'experiment' as const,
						seed: 'a.seed',
						hash_attribute: 'wpcom_user_id' as const,
						experiment_id: 1,
						variations: [
							{
								name: 'control',
								value: 'control',
								is_default: true,
								experiment_variation_id: 1,
								range: [ 0, 0.5 ] as [ number, number ],
							},
							{
								name: 'treatment',
								value: 'treatment',
								is_default: false,
								experiment_variation_id: 2,
								range: [ 0.5, 1 ] as [ number, number ],
							},
						],
					},
				],
			},
		},
	};

	test( 'getKnownFlags returns [] before any flag is evaluated', () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client } = makeClient( samplePayload, { wpcom_user_id: '1' } );
		expect( client.devtools.getKnownFlags() ).toEqual( [] );
	} );

	test( 'getKnownFlags returns flag keys from the cached payload after first eval', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client } = makeClient( samplePayload, { wpcom_user_id: '1' } );
		await client.getFeatureValue( 'a', 'control' );
		expect( client.devtools.getKnownFlags() ).toEqual( [ 'a' ] );
	} );

	test( 'getKnownVariations returns the variation values defined for a flag', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client } = makeClient( samplePayload, { wpcom_user_id: '1' } );
		await client.getFeatureValue( 'a', 'control' );
		expect( client.devtools.getKnownVariations( 'a' ) ).toEqual( [ 'control', 'treatment' ] );
	} );

	test( 'getKnownVariations returns [] for unknown flags', () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client } = makeClient( samplePayload, { wpcom_user_id: '1' } );
		expect( client.devtools.getKnownVariations( 'nope' ) ).toEqual( [] );
	} );
} );

describe( 'devtools.previewFeatureValue', () => {
	beforeEach( () => {
		jest.restoreAllMocks();
		setBrowserContext();
		polyfilledLocalStorage.removeItem( FORCED_FEATURES_STORAGE_KEY );
	} );

	const samplePayload = {
		schema_version: 1,
		ttl: 7200,
		flags: {
			a: {
				value_type: 'string' as const,
				default_value: 'control',
				rules: [
					{
						type: 'experiment' as const,
						seed: 'a.seed',
						hash_attribute: 'wpcom_user_id' as const,
						experiment_id: 1,
						variations: [
							{
								name: 'control',
								value: 'control',
								is_default: true,
								experiment_variation_id: 1,
								range: [ 0, 0.5 ] as [ number, number ],
							},
							{
								name: 'treatment',
								value: 'treatment',
								is_default: false,
								experiment_variation_id: 2,
								range: [ 0.5, 1 ] as [ number, number ],
							},
						],
					},
				],
			},
		},
	};

	test( 'returns the natural eval result, ignoring any forced override', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client } = makeClient( samplePayload, { wpcom_user_id: '1' } );
		client.devtools.forcedFeatures.set( 'a', 'totally_overridden' );
		const result = await client.devtools.previewFeatureValue( 'a' );
		expect( result?.source ).toBe( 'experiment' );
		expect( result?.value ).toMatch( /^(control|treatment)$/ );
	} );

	test( 'does NOT fire a beacon', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client, config } = makeClient( samplePayload, { wpcom_user_id: '1' } );
		await client.devtools.previewFeatureValue( 'a' );
		expect( config.logFeatureAssignment ).not.toHaveBeenCalled();
	} );

	test( 'does NOT add to the eval log', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client } = makeClient( samplePayload, { wpcom_user_id: '1' } );
		await client.devtools.previewFeatureValue( 'a' );
		expect( client.devtools.evalLog.entries() ).toEqual( [] );
	} );

	test( 'returns null when the flag is unknown', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'normal',
			can_evaluate: true,
			can_log_assignment: true,
			can_create_assignment: true,
		} );
		const { client } = makeClient( samplePayload, { wpcom_user_id: '1' } );
		const result = await client.devtools.previewFeatureValue( 'nope' );
		expect( result ).toBeNull();
	} );

	test( 'returns null when the runtime cannot evaluate', async () => {
		setRuntime( {
			schema_version: 1,
			mode: 'blocked',
			can_evaluate: false,
		} );
		const { client } = makeClient( samplePayload, { wpcom_user_id: '1' } );
		const result = await client.devtools.previewFeatureValue( 'a' );
		expect( result ).toBeNull();
	} );
} );
