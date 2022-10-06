import moment from 'moment';
import { sameDay, sameSite, injectRecommendations } from '../utils';

describe( 'reader stream', () => {
	const today = moment().toDate();
	const postKey1 = { feedId: 'feed1', postId: 'postId1', date: today };
	const postKey2 = { feedId: 'feed1', postId: 'postId2', date: today };

	describe( '#sameDay', () => {
		const datePostKey = ( date ) => ( { date } );
		const todayPostKey = datePostKey( today );
		const todayPostKey2 = datePostKey( new Date() );
		const oneYearAgoPostKey = datePostKey( moment( today ).subtract( 1, 'year' ).toDate() );
		const oneYearInTheFuturePostKey = datePostKey( moment( today ).add( 1, 'year' ).toDate() );
		const oneMonthAgoPostKey = datePostKey( moment( today ).subtract( 1, 'month' ).toDate() );

		test( 'should return true when two days are the same day', () => {
			expect( sameDay( todayPostKey, todayPostKey2 ) ).toBe( true );
		} );

		test( 'should return false when two days are not the same day', () => {
			expect( sameDay( todayPostKey, oneYearAgoPostKey ) ).toBe( false );
			expect( sameDay( todayPostKey, oneYearInTheFuturePostKey ) ).toBe( false );
			expect( sameDay( todayPostKey, oneMonthAgoPostKey ) ).toBe( false );
		} );
	} );

	describe( '#sameSite', () => {
		test( 'should return true when two postKeys represent the same site', () => {
			const postId = 'postId';
			const isSame = sameSite( { blogId: 'site1', postId }, { blogId: 'site1', postId } );
			expect( isSame ).toBe( true );
		} );

		test( 'should return true when two postKeys represent the same feed', () => {
			const isSame = sameSite( postKey1, postKey2 );
			expect( isSame ).toBe( true );
		} );

		test( 'recs should never be marked as sameSite', () => {
			const isSame = sameSite(
				{ ...postKey1, isRecommendationBlock: 'isRecommendationBlock' },
				postKey1
			);
			expect( isSame ).toBe( false );
		} );
	} );

	describe( '#injectRecommendations', () => {
		const rec = () => ( { type: 'rec' } );
		const post = () => ( { type: 'post' } );

		const createRecBlock = ( recs, index ) => ( {
			isRecommendationBlock: true,
			index,
			recommendations: recs,
		} );

		test( 'should not modify items if empty recs', () => {
			const items = [ {} ];
			const injectedItems = injectRecommendations( items, [], 1 );

			expect( injectedItems ).toEqual( items );
		} );

		test( 'should not modify items if cards per rec is greater than length of items', () => {
			const recs = [ postKey1, postKey1, postKey1, postKey1 ];
			const items = [ {} ];
			const injectedItems = injectRecommendations( items, recs, 1 );

			expect( injectedItems ).toEqual( items );
		} );

		test( 'should inject 2 recs for each regular post when cards per rec = 1', () => {
			const recs = [ rec(), rec(), rec(), rec(), rec(), rec(), rec(), rec() ];
			const items = [ post(), post(), post(), post(), post() ];
			const injectedItems = injectRecommendations( items, recs, 1 );

			expect( injectedItems ).toEqual( [
				post(),
				createRecBlock( [ rec(), rec() ], 0 ),
				post(),
				createRecBlock( [ rec(), rec() ], 2 ),
				post(),
				createRecBlock( [ rec(), rec() ], 4 ),
				post(),
				createRecBlock( [ rec(), rec() ], 6 ),
				post(),
			] );
		} );

		test( 'should gracefully run out of recs by inserting until it runs out', () => {
			const recs = [ rec(), rec() ];
			const items = [ post(), post(), post() ];
			const injectedItems = injectRecommendations( items, recs, 1 );

			expect( injectedItems ).toEqual( [
				post(),
				createRecBlock( [ rec(), rec() ], 0 ),
				post(),
				post(),
			] );
		} );

		test( 'should inject 2 recs for each 4 regular posts when cards per rec = 4', () => {
			const recs = [ rec(), rec() ];
			const items = [ post(), post(), post(), post(), post() ];
			const injectedItems = injectRecommendations( items, recs, 4 );

			expect( injectedItems ).toEqual( [
				post(),
				post(),
				post(),
				post(),
				createRecBlock( [ rec(), rec() ], 0 ),
				post(),
			] );
		} );
	} );
} );
