/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { ACTIVITY_LOG_UPDATE, DESERIALIZE, SERIALIZE } from 'state/action-types';
import { logItems } from '../reducer';
import { useSandbox } from 'test/helpers/use-sinon';
import { withSchemaValidation } from 'state/utils';

const logItemsReducer = withSchemaValidation( logItems.schema, logItems );

describe( 'reducer', () => {
	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
	} );

	describe( '#logItems()', () => {
		it( 'should default to an empty object', () => {
			const state = logItemsReducer( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should populate state with activity', () => {
			const siteId = 12345;
			const data = deepFreeze( [
				{
					ts_utc: 1502108367646,
					name: 'user__failed_login_attempt',
				},
			] );
			const state = logItemsReducer( undefined, {
				type: ACTIVITY_LOG_UPDATE,
				siteId,
				data,
			} );

			expect( state ).to.eql( {
				[ 12345 ]: data,
			} );
		} );

		it( 'should persist state', () => {
			const original = deepFreeze( {
				12345: [
					{
						ts_utc: 1502108367646,
						name: 'user__failed_login_attempt',
					},
				],
			} );
			const state = logItemsReducer( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				12345: [
					{
						ts_utc: 1502108367646,
						name: 'user__failed_login_attempt',
					},
				],
			} );

			const state = logItemsReducer( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				12345: [
					{
						name: 'user__failed_login_attempt',
					},
				],
			} );
			const state = logItemsReducer( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
