/**
 * External dependencies
 */
import { expect } from 'chai';
import freeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { subscriptionsFromApi, isValidApiResponse } from '../utils';

const successfulApiResponse = freeze( {
	number: 2,
	page: 1,
	total_subscriptions: 2,
	subscriptions: [
		{
			ID: '12345',
			blog_ID: '122463145',
			URL: 'http://readerpostcards.wordpress.com',
			date_subscribed: '2017-01-12T03:55:45+00:00',
		},
		{
			ID: '123456',
			blog_ID: '64146350',
			URL: 'https://fivethirtyeight.com/',
			date_subscribed: '2016-01-12T03:55:45+00:00',
		},
	],
} );

describe( '#isValidApiResponse', () => {
	test( 'should return false for invalid responses', () => {
		expect( isValidApiResponse( {} ) ).not.ok;
		expect( isValidApiResponse( { notExpected: 'true' } ) ).not.ok;
		expect( isValidApiResponse( { subscriptions: 'notAnArray' } ) ).not.ok;
	} );

	test( 'should return true for happy cases', () => {
		expect( isValidApiResponse( { subscriptions: [] } ) ).ok;
		expect( isValidApiResponse( successfulApiResponse ) ).ok;
	} );
} );

describe( '#subscriptionsFromApi', () => {
	test( 'should return subscriptions from the apiResponse', () => {
		const transformedSubs = [
			{
				ID: 12345,
				blog_ID: 122463145,
				URL: 'http://readerpostcards.wordpress.com',
				feed_URL: 'http://readerpostcards.wordpress.com',
				date_subscribed: Date.parse( '2017-01-12T03:55:45+00:00' ),
			},
			{
				ID: 123456,
				blog_ID: 64146350,
				URL: 'https://fivethirtyeight.com/',
				feed_URL: 'https://fivethirtyeight.com/',
				date_subscribed: Date.parse( '2016-01-12T03:55:45+00:00' ),
			},
		];
		expect( subscriptionsFromApi( successfulApiResponse ) ).eql( transformedSubs );
	} );

	test( 'should return an empty list from invalid apiResponse', () => {
		expect( subscriptionsFromApi( { notExpected: 'true' } ) ).eql( [] );
		expect( subscriptionsFromApi( { subscriptions: 'true' } ) ).eql( [] );
	} );
} );
