import { it, describe, expect } from '@jest/globals';
import { createEventMatchingPredicate } from '../../../src/lib/utils/editor-tracks-event-manager';
import { TracksEvent } from '../../../src/types';

describe( 'Test: createEventMatchingPredicate', function () {
	const fakeTracksEvents: TracksEvent[] = [
		[ 'wpcom_event_a', { prop_1: 'foo', prop_2: 'bar' } ],
		[ 'wpcom_event_b', {} ],
	];

	it( 'Finds a matching event by name', function () {
		const expectedEventName = 'wpcom_event_b';
		const foundEvent = fakeTracksEvents.find( createEventMatchingPredicate( expectedEventName ) );
		expect( foundEvent?.[ 0 ] ).toBe( expectedEventName );
	} );

	it( 'Does not match on an event that does not match by name', function () {
		const foundEvent = fakeTracksEvents.find( createEventMatchingPredicate( 'no_event_here' ) );
		expect( foundEvent ).toBeUndefined();
	} );

	it( 'Does a partial match of expected event properties', function () {
		const expectedEventName = 'wpcom_event_a';
		const foundEvent = fakeTracksEvents.find(
			createEventMatchingPredicate( expectedEventName, { prop_2: 'bar' } )
		);
		expect( foundEvent?.[ 0 ] ).toBe( expectedEventName );
	} );

	it( 'Does not match on an event if property value is incorrect', function () {
		const foundEvent = fakeTracksEvents.find(
			createEventMatchingPredicate( 'wpcom_event_a', { prop_2: 'wrong' } )
		);
		expect( foundEvent ).toBeUndefined();
	} );

	it( 'Does not match on an event if property key itself is incorrect', function () {
		const foundEvent = fakeTracksEvents.find(
			createEventMatchingPredicate( 'wpcom_event_a', { wrong_prop: 'foo' } )
		);
		expect( foundEvent ).toBeUndefined();
	} );

	it( 'Requires all provided properties to match', function () {
		const foundEvent = fakeTracksEvents.find(
			createEventMatchingPredicate( 'wpcom_event_a', { prop_1: 'foo', prop_2: 'second_is_wrong' } )
		);
		expect( foundEvent ).toBeUndefined();
	} );
} );
