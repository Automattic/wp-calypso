/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { itemsReducer, processItem } from '../from-api';

const SITE_ID = 123456;

const VALID_API_ITEM = deepFreeze( {
	summary: 'Jane Doe updated post I wrote a new post!',
	name: 'post__updated',
	actor: {
		type: 'Person',
		name: 'Jane Doe',
		role: 'administrator',
		external_user_id: 1,
		wpcom_user_id: 12345,
		icon: {
			type: 'Image',
			url: 'https://secure.gravatar.com/avatar/0?s=96&d=mm&r=g',
			width: 96,
			height: 96,
		},
	},
	type: 'Updated',
	object: {
		type: 'Article',
		name: 'I wrote a new post!',
		object_id: 100,
		object_type: 'post',
		object_status: 'publish',
	},
	published: '2014-09-14T00:30:00+02:00',
	generator: {
		jetpack_version: 5.3,
		blog_id: SITE_ID,
	},
	gridicon: 'posts',
	activity_id: 'foobarbaz',
	status: 'warning',
} );

describe( 'itemsReducer', () => {
	it( 'should return a new array', () => {
		const accumulator = [];
		expect( itemsReducer( accumulator, VALID_API_ITEM ) ).to.not.equal( accumulator );
	} );

	it( 'should add items to array', () => {
		expect( itemsReducer( [], VALID_API_ITEM ) ).to.be.an( 'array' ).that.is.not.empty;
	} );

	it( 'should append valid items to array', () => {
		const existingItem = Object.create( null );
		const result = itemsReducer( [ existingItem ], VALID_API_ITEM );
		expect( result ).to.be.an( 'array' );
		expect( result.length ).to.equal( 2 );
		expect( result[ 0 ] ).to.equal( existingItem );
	} );
} );

describe( 'processItem', () => {
	it( 'should process an item', () => {
		expect( processItem( VALID_API_ITEM ) )
			.to.be.an( 'object' )
			.that.has.keys( [
				'activityDate',
				'activityGroup',
				'activityIcon',
				'activityId',
				'activityName',
				'activityStatus',
				'activityTitle',
				'activityTs',
				'actorAvatarUrl',
				'actorName',
				'actorRemoteId',
				'actorRole',
				'actorType',
				'actorWpcomId',
			] );
	} );
} );
