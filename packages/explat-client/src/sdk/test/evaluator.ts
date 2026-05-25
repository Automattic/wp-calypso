import { evalFeature } from '../evaluator';
import type { ExperimentVariation, Feature } from '../types';

const variations: ExperimentVariation[] = [
	{
		name: 'control',
		value: false,
		is_default: true,
		experiment_variation_id: 9001,
		range: [ 0, 0.5 ],
	},
	{
		name: 'treatment',
		value: true,
		is_default: false,
		experiment_variation_id: 9002,
		range: [ 0.5, 1 ],
	},
];

describe( 'evalFeature', () => {
	it( 'returns the default when no rules match', () => {
		const feature: Feature = { value_type: 'boolean', default_value: false, rules: [] };
		expect( evalFeature( feature, { wpcom_user_id: '1' } ) ).toEqual( {
			value: false,
			source: 'default',
		} );
	} );

	it( 'applies an unconditional force rule', () => {
		const feature: Feature = {
			value_type: 'string',
			default_value: 'control',
			rules: [ { type: 'force', value: 'on' } ],
		};
		expect( evalFeature( feature, {} ) ).toEqual( { value: 'on', source: 'force' } );
	} );

	it( 'applies a force rule whose condition passes', () => {
		const feature: Feature = {
			value_type: 'string',
			default_value: 'off',
			rules: [ { type: 'force', value: 'on', condition: { country: 'US' } } ],
		};
		expect( evalFeature( feature, { country: 'US' } ) ).toEqual( {
			value: 'on',
			source: 'force',
		} );
	} );

	it( 'falls through when a force rule’s condition fails', () => {
		const feature: Feature = {
			value_type: 'string',
			default_value: 'off',
			rules: [ { type: 'force', value: 'on', condition: { country: 'US' } } ],
		};
		expect( evalFeature( feature, { country: 'CA' } ) ).toEqual( {
			value: 'off',
			source: 'default',
		} );
	} );

	it( 'falls through when an experiment rule’s hash attribute is missing', () => {
		const feature: Feature = {
			value_type: 'boolean',
			default_value: false,
			rules: [
				{
					type: 'experiment',
					seed: 'exp_a',
					hash_attribute: 'wpcom_user_id',
					experiment_id: 1,
					variations,
				},
			],
		};
		expect( evalFeature( feature, { country: 'US' } ) ).toEqual( {
			value: false,
			source: 'default',
		} );
	} );

	it( 'first matching rule wins', () => {
		const feature: Feature = {
			value_type: 'string',
			default_value: 'off',
			rules: [
				{ type: 'force', value: 'A' },
				{ type: 'force', value: 'B' },
			],
		};
		expect( evalFeature( feature, {} ) ).toMatchObject( { value: 'A', source: 'force' } );
	} );

	it( 'experiment rule populates the result envelope', () => {
		const feature: Feature = {
			value_type: 'boolean',
			default_value: false,
			rules: [
				{
					type: 'experiment',
					seed: 'a',
					hash_attribute: 'wpcom_user_id',
					experiment_id: 12345,
					variations,
				},
			],
		};
		// hash( "a", "1" ) = 0.8633 → falls into the [0.5, 1) bucket.
		expect( evalFeature( feature, { wpcom_user_id: '1' } ) ).toEqual( {
			source: 'experiment',
			value: true,
			experiment_id: 12345,
			experiment_variation_id: 9002,
			hash_attribute: 'wpcom_user_id',
			hash_value: '1',
		} );
	} );

	it( 'falls through when the user is outside coverage', () => {
		// Single variation with [0, 0.5] coverage; hash("a", "1") = 0.8633 → outside.
		const feature: Feature = {
			value_type: 'string',
			default_value: 'control',
			rules: [
				{
					type: 'experiment',
					seed: 'a',
					hash_attribute: 'wpcom_user_id',
					experiment_id: 1,
					variations: [
						{
							name: 'only',
							value: 'only',
							is_default: true,
							experiment_variation_id: 1,
							range: [ 0, 0.5 ],
						},
					],
				},
			],
		};
		expect( evalFeature( feature, { wpcom_user_id: '1' } ) ).toEqual( {
			value: 'control',
			source: 'default',
		} );
	} );
} );
