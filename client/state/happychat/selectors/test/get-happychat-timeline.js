/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getHappychatTimeline from '../get-happychat-timeline';

describe( '#getHappychatTimeline', () => {
	// Simulate the time Feb 27, 2017 05:25 UTC
	const NOW = 1488173100125;
	const ONE_MINUTE = 1000 * 60;
	const FIVE_MINUTES = ONE_MINUTE * 5;
	const timelineAtTime1 = [
		{ timestamp: NOW - FIVE_MINUTES, id: '1-1' },
		{ timestamp: NOW - ONE_MINUTE, id: '1-2' },
		{ timestamp: NOW, id: '1-3' },
	];
	const timelineAtTime2 = [
		{ timestamp: NOW - FIVE_MINUTES, id: '2-1' },
		{ timestamp: NOW - ONE_MINUTE, id: '2-2' },
		{ timestamp: NOW, id: '2-3' },
	];
	const timelineWithoutIds1 = [ { timestamp: NOW - FIVE_MINUTES }, { timestamp: NOW } ];
	const timelineWithoutIds2 = [ { timestamp: NOW - ONE_MINUTE }, { timestamp: NOW } ];

	test( 'returns the cached timeline if message do not have ids', () => {
		const state = {
			happychat: {
				chat: {
					timeline: timelineWithoutIds1,
				},
			},
		};
		const timelineCached = getHappychatTimeline( state );
		// force a new reference, but with the same data
		state.happychat.chat.timeline = [ ...timelineWithoutIds2 ];
		expect( getHappychatTimeline( state ) ).to.be.equals( timelineCached );
	} );

	test( 'returns the cached timeline if messages ids are the same', () => {
		const state = {
			happychat: {
				chat: {
					timeline: timelineAtTime1,
				},
			},
		};
		const timelineCached = getHappychatTimeline( state );
		// force a new reference, but with the same data
		state.happychat.chat.timeline = [ ...timelineAtTime1 ];
		expect( getHappychatTimeline( state ) ).to.be.equals( timelineCached );
	} );

	test( 'returns the new timeline if some message id is different', () => {
		const state = {
			happychat: {
				chat: {
					timeline: timelineAtTime1,
				},
			},
		};
		const timelineCached = getHappychatTimeline( state );
		// force a new reference, but with the same data
		state.happychat.chat.timeline = [ ...timelineAtTime2 ];
		expect( getHappychatTimeline( state ) ).to.not.be.equals( timelineCached );
	} );
} );
