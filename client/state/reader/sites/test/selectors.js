import { shouldSiteBeFetched } from '../selectors';

describe( 'selectors', () => {
	describe( 'shouldSiteBeFetched', () => {
		test( 'should return false if the fetch is queued', () => {
			expect(
				shouldSiteBeFetched(
					{
						reader: {
							sites: {
								queuedRequests: {
									1: true,
								},
								items: {},
								lastFetched: {},
							},
						},
					},
					1
				)
			).toBe( false );
		} );

		test( 'should return false if the site is loaded and recent', () => {
			expect(
				shouldSiteBeFetched(
					{
						reader: {
							sites: {
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
			).toBe( false );
		} );

		test( 'should return true if the site is loaded and has no last fetch time', () => {
			expect(
				shouldSiteBeFetched(
					{
						reader: {
							sites: {
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
			).toBe( true );
		} );

		test( 'should return true if the site is loaded and was not updated recently', () => {
			expect(
				shouldSiteBeFetched(
					{
						reader: {
							sites: {
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
			).toBe( true );
		} );

		test( 'should return true if the site is not queued and not loaded', () => {
			expect(
				shouldSiteBeFetched(
					{
						reader: {
							sites: {
								queuedRequests: {},
								items: {},
								lastFetched: {},
							},
						},
					},
					1
				)
			).toBe( true );
		} );

		test( 'should still return true if another site is queued or loaded', () => {
			expect(
				shouldSiteBeFetched(
					{
						reader: {
							sites: {
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
			).toBe( true );
		} );
	} );
} );
