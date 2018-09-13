/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getCommunityEvents from 'state/selectors/get-community-events';

const events = [
	{
		type: 'meetup',
		title: 'WordPress St.Albans Meetup #17 - Hostings!',
		url: 'https://www.meetup.com/St-Albans-WordPress-Meetup/events/253458804/',
	},
	{
		type: 'meetup',
		title: 'WordPress Meetup - WPTW',
		url: 'https://www.meetup.com/Tunbridge-Wells-Small-Business-Meetup/events/251996334/',
	},
];

describe( 'getCommunityDependencies()', () => {
	test( 'should return an empty array if there are no events', () => {
		const state = {};

		expect( getCommunityEvents( state ) ).to.eql( [] );
	} );

	test( 'should return an array of events', () => {
		const state = {
			communityEvents: {
				events: events,
			},
		};

		expect( getCommunityEvents( state ) ).to.deep.equal( events );
	} );
} );
