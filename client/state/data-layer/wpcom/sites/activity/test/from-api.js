/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { processItem } from '../from-api';

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
	is_rewindable: false,
	rewind_id: 0,
} );

describe( 'processItem', () => {
	test( 'should process an item', () => {
		expect( processItem( VALID_API_ITEM ) )
			.to.be.an( 'object' )
			.that.contains.keys( [
				'activityDate',
				'activityGroup',
				'activityIcon',
				'activityId',
				'activityIsRewindable',
				'rewindId',
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
