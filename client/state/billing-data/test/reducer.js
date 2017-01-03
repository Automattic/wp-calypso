/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	BILLING_DATA_RECEIVE,
	BILLING_DATA_REQUEST,
	BILLING_DATA_REQUEST_FAILURE,
	BILLING_DATA_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, { requesting, items } from '../reducer';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'items'
		] );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an false', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should set requesting to true value if a request is initiated', () => {
			const state = requesting( undefined, {
				type: BILLING_DATA_REQUEST,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should set requesting to false if request finishes successfully', () => {
			const state = requesting( true, {
				type: BILLING_DATA_REQUEST_SUCCESS,
			} );

			expect( state ).to.eql( false );
		} );

		it( 'should set requesting to false if request finishes unsuccessfully', () => {
			const state = requesting( true, {
				type: BILLING_DATA_REQUEST_FAILURE,
			} );

			expect( state ).to.eql( false );
		} );

		it( 'should not persist state', () => {
			const state = requesting( true, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( false );
		} );

		it( 'should not load persisted state', () => {
			const state = requesting( true, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( false );
		} );
	} );

	describe( '#items()', () => {
		const billingData = {
			past: [
				{
					id: '12345678',
					amount: '$1.23',
				}
			],
			upcoming: [
				{
					id: '87654321',
					amount: '$4.56',
				}
			]
		};

		it( 'should default to null', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( null );
		} );

		it( 'should store the billing history properly', () => {
			const state = items( null, {
				type: BILLING_DATA_RECEIVE,
				...billingData
			} );

			expect( state ).to.eql( billingData );
		} );

		it( 'should override previous billing history', () => {
			const state = items( deepFreeze( {
				past: [
					{
						id: '11223344',
						amount: '$3.43',
						desc: 'test'
					}
				],
				upcoming: [
					{
						id: '88776655',
						amount: '$1.11',
						product: 'example'
					}
				]
			} ), {
				type: BILLING_DATA_RECEIVE,
				...billingData
			} );

			expect( state ).to.eql( billingData );
		} );

		it( 'should persist state', () => {
			const state = items( deepFreeze( billingData ), {
				type: SERIALIZE
			} );

			expect( state ).to.eql( billingData );
		} );

		it( 'should load valid persisted state', () => {
			const state = items( deepFreeze( billingData ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( billingData );
		} );

		it( 'should not load invalid persisted state', () => {
			const state = items( deepFreeze( {
				example: 'test'
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( null );
		} );
	} );
} );
