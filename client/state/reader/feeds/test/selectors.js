/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { shouldFeedBeFetched } from '../selectors';

describe( 'selectors', () => {
	describe( 'shouldFeedBeFetched', () => {
		test( 'should return false if the fetch is queued', () => {
			expect(
				shouldFeedBeFetched(
					{
						reader: {
							feeds: {
								queuedRequests: {
									1: true,
								},
								items: {},
							},
						},
					},
					1
				)
			).to.be.false;
		} );

		test( 'should return false if the feed is loaded and recent', () => {
			expect(
				shouldFeedBeFetched(
					{
						reader: {
							feeds: {
								queuedRequests: {},
								items: {
									1: {},
								},
								lastFetched: {
									1: Date.now(),
								},
							},
						},
					},
					1
				)
			).to.be.false;
		} );

		test( 'should return true if the feed is loaded, but no fetch time exists', () => {
			expect(
				shouldFeedBeFetched(
					{
						reader: {
							feeds: {
								queuedRequests: {},
								items: {
									1: {},
								},
								lastFetched: {},
							},
						},
					},
					1
				)
			).to.be.true;
		} );

		test( 'should return true if the feed is loaded, but old', () => {
			expect(
				shouldFeedBeFetched(
					{
						reader: {
							feeds: {
								queuedRequests: {},
								items: {
									1: {},
								},
								lastFetched: {
									1: 100,
								},
							},
						},
					},
					1
				)
			).to.be.true;
		} );

		test( 'should return true if the feed is not queued and not loaded', () => {
			expect(
				shouldFeedBeFetched(
					{
						reader: {
							feeds: {
								queuedRequests: {},
								items: {},
								lastFetched: {},
							},
						},
					},
					1
				)
			).to.be.true;
		} );

		test( 'should still return true if another feed is queued or loaded', () => {
			expect(
				shouldFeedBeFetched(
					{
						reader: {
							feeds: {
								queuedRequests: {
									2: true,
								},
								items: {
									2: {},
								},
								lastFetched: {},
							},
						},
					},
					1
				)
			).to.be.true;
		} );
	} );
} );
