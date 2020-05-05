/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { coerceValue } from '../coerce-values.js';

describe( '#coerceValue', () => {
	it( 'Returns null when value is null', () => {
		const schema = {
			$ref: '#/definitions/shipping_service',
		};
		const value = null;
		const definitions = {
			shipping_service: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
					},
					enabled: {
						type: 'boolean',
						default: false,
					},
					adjustment: {
						type: 'number',
						default: 0,
					},
					adjustment_type: {
						type: 'string',
						enum: [ 'flat', 'percentage' ],
						default: 'flat',
					},
				},
			},
			services: [
				{
					id: 'pri',
					name: 'PriorityMail',
					group: 'priority',
					group_name: 'PriorityMail',
				},
				{
					id: 'pri_flat_env',
					name: 'PriorityMail-FlatRateEnvelope',
					group: 'priority',
					group_name: 'PriorityMail',
					predefined_package: 'flat_envelope',
				},
			],
		};

		const result = coerceValue( schema, value, definitions );

		expect( result ).to.equal( null );
	} );
} );
