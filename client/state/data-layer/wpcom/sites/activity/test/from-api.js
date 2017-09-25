/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import fromApi, { ACTIVITY_REQUIRED_PROPS, processItem, itemsReducer, validateItem } from '../from-api';

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
} );

const API_RESPONSE_BODY = deepFreeze( {
	'@context': 'https://www.w3.org/ns/activitystreams',
	id: `https://public-api.wordpress.com/wpcom/v2/sites/${ SITE_ID }/activity`,
	itemsPerPage: 1000,
	page: 1,
	summary: 'Activity log',
	totalItems: 1,
	totalPages: 1,
	type: 'OrderedCollection',

	current: {
		totalItems: 1,
		orderedItems: [ VALID_API_ITEM ],
		type: 'OrderedCollectionPage',
		id: `https://public-api.wordpress.com/wpcom/v2/sites/${ SITE_ID }/activity?number=1000`,
	},
} );

describe( 'fromApi', () => {
	it( 'should process a valid API response', () => {
		expect( fromApi( API_RESPONSE_BODY ) ).to.be.an( 'array' ).that.is.not.empty;
	} );

	it( 'should process an empty response', () => {
		expect(
			fromApi( {
				...API_RESPONSE_BODY,
				totalItems: 0,
				current: {
					...API_RESPONSE_BODY.current,
					totalItems: 0,
					orderedItems: [],
				},
			} )
		).to.be.an( 'array' ).that.is.empty;
	} );

	context( 'itemsReducer', () => {
		it( 'should return a new array', () => {
			const accumulator = [];
			expect( itemsReducer( accumulator, VALID_API_ITEM ) ).to.not.equal( accumulator );
		} );

		it( 'should add valid items to array', () => {
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

	context( 'processItem', () => {
		it( 'should process an item', () => {
			expect( processItem( VALID_API_ITEM ) )
				.to.be.an( 'object' )
				.that.has.keys( [
					'activityDate',
					'activityGroup',
					'activityIcon',
					'activityId',
					'activityName',
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

	context( 'validateItem', () => {
		ACTIVITY_REQUIRED_PROPS.forEach( property => {
			it( `should return false if required property is missing (${ property })`, () => {
				expect( validateItem( omit( VALID_API_ITEM, property ) ) ).to.be.false;
			} );
		} );

		it( 'should return true if all conditions are met', () => {
			expect( validateItem( VALID_API_ITEM ) ).to.be.true;
		} );
	} );
} );
