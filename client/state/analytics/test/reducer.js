/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { ANALYTICS_EVENT_RECORD } from 'state/action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	it( 'should persist append event ID to recorded events', () => {
		const events = deepFreeze( {
			'event-chicken': true
		} );
		const action = {
			type: ANALYTICS_EVENT_RECORD,
			meta: {
				analytics: [ {
					type: ANALYTICS_EVENT_RECORD,
					payload: { eventId: 'event-ribs' }
				} ]
			}
		};
		expect( reducer( events, action ) ).to.eql( {
			'event-chicken': true,
			'event-ribs': true
		} );
	} );

	it( 'should not persist event if no id provided', () => {
		const events = deepFreeze( {
			'event-chicken': true
		} );
		const action = {
			type: ANALYTICS_EVENT_RECORD,
			meta: {
				analytics: [ {
					type: ANALYTICS_EVENT_RECORD,
					payload: { label: 'ribs' }
				} ]
			}
		};
		expect( reducer( events, action ) ).to.eql( events );
	} );
} );
