/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { logItems } from '../reducer';
import { ACTIVITY_LOG_UPDATE, DESERIALIZE, SERIALIZE } from 'state/action-types';
import { withSchemaValidation } from 'state/utils';
import { useSandbox } from 'test/helpers/use-sinon';

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
					activityDate: '2017-08-27T00:00:59+00:00',
					activityGroup: 'plugin',
					activityIcon: 'plugins',
					activityId: 'foobarbas',
					activityName: 'plugin__updated',
					activityTitle: 'Jetpack by WordPress.com plugin was updated to version 5.3',
					activityTs: 1503792059000,
					actorAvatarUrl: 'https://secure.gravatar.com/avatar/0?s=96&d=mm&r=g',
					actorName: 'User display name',
					actorRemoteId: 1,
					actorRole: 'administrator',
					actorType: 'Person',
					actorWpcomId: 123456,
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
						activityDate: '2017-08-27T00:00:59+00:00',
						activityGroup: 'plugin',
						activityIcon: 'plugins',
						activityId: 'foobarbas',
						activityName: 'plugin__updated',
						activityTitle: 'Jetpack by WordPress.com plugin was updated to version 5.3',
						activityTs: 1503792059000,
						actorAvatarUrl: 'https://secure.gravatar.com/avatar/0?s=96&d=mm&r=g',
						actorName: 'User display name',
						actorRemoteId: 1,
						actorRole: 'administrator',
						actorType: 'Person',
						actorWpcomId: 123456,
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
						activityDate: '2017-08-27T00:00:59+00:00',
						activityGroup: 'plugin',
						activityIcon: 'plugins',
						activityId: 'foobarbas',
						activityName: 'plugin__updated',
						activityTitle: 'Jetpack by WordPress.com plugin was updated to version 5.3',
						activityTs: 1503792059000,
						actorAvatarUrl: 'https://secure.gravatar.com/avatar/0?s=96&d=mm&r=g',
						actorName: 'User display name',
						actorRemoteId: 1,
						actorRole: 'administrator',
						actorType: 'Person',
						actorWpcomId: 123456,
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
						activityName: 'Not a known Activity name.',
					},
				],
			} );
			const state = logItemsReducer( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
