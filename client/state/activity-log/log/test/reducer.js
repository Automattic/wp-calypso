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
import ActivityQueryManager from 'lib/query-manager/activity';
import { ACTIVITY_LOG_UPDATE } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

const SITE_ID = 123456789;
const ACTIVITY_ITEM = deepFreeze( {
	activityDate: '2017-08-27T00:00:59+00:00',
	activityGroup: 'plugin',
	activityIcon: 'plugins',
	activityId: 'foobarbas',
	activityIsRewindable: false,
	activityName: 'plugin__updated',
	activityStatus: 'warning',
	activityTitle: 'Jetpack by WordPress.com plugin was updated to version 5.3',
	activityTs: 1503792059000,
	actorAvatarUrl: 'https://secure.gravatar.com/avatar/0?s=96&d=mm&r=g',
	actorName: 'User display name',
	actorRemoteId: 1,
	actorRole: 'administrator',
	actorType: 'Person',
	actorWpcomId: 123456,
} );

const populateQueryManager = ( data = [], query = {} ) =>
	new ActivityQueryManager().receive( data, { found: data.length, query } );

describe( 'reducer', () => {
	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
	} );

	describe( '#logItems()', () => {
		test( 'should default to an empty object', () => {
			const state = logItems( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should populate state with activity', () => {
			const data = deepFreeze( [ ACTIVITY_ITEM ] );
			const state = logItems( undefined, {
				type: ACTIVITY_LOG_UPDATE,
				siteId: SITE_ID,
				data,
				found: data.length,
				query: {},
			} );

			expect( state ).to.eql( {
				[ SITE_ID ]: populateQueryManager( data, {} ),
			} );
		} );
	} );
} );
