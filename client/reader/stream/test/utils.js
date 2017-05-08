/**
 * External dependencies
 */
import { expect, assert } from 'chai';
import moment from 'moment';
import mockery from 'mockery';
let utils, sameDay, sameSite, combine, combineCards, injectRecommendations;

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'reader stream', () => {
	useMockery();
	before( () => {
		mockery.registerMock( 'lib/user/utils', {} );
		utils = require( '../utils' );
		sameDay = utils.sameDay;
		sameSite = utils.sameSite;
		combine = utils.combine;
		combineCards = utils.combineCards;
		injectRecommendations = utils.injectRecommendations;
	} );

	const postKey1 = { feedId: 'feed1', postId: 'postId1' };
	const postKey2 = { feedId: 'feed1', postId: 'postId2' };
	const postIds34 = [ 'postId3', 'postId4' ];
	const postIds57 = [ 'postId5', 'postId6', 'postId7' ];
	const combinedCardPostKey1 = ( {
		feedId: postKey1.feedId,
		postIds: postIds34,
		localMoment: undefined,
		isCombination: true,
	} );
	const combinedCardPostKey2 = ( {
		feedId: postKey1.feedId,
		postIds: postIds57,
		localMoment: undefined,
		isCombination: true,
	} );

	describe( '#sameDay', () => {
		const momentPostKey = localMoment => ( { localMoment } );
		const today = moment();
		const todayPostKey = momentPostKey( today );
		const todayPostKey2 = momentPostKey( moment() );
		const oneYearAgoPostKey = momentPostKey( moment().year( today.year() - 1 ) );
		const oneYearInTheFuturePostKey = momentPostKey( moment().year( today.year() + 1 ) );
		const oneMonthAgoPostKey = momentPostKey( moment().month( today.month() - 1 ) );

		it( 'should return true when two days are the same day', () => {
			assert( sameDay( todayPostKey, todayPostKey2 ) );
		} );

		it( 'should return false when two days are not the same day', () => {
			assert( ! sameDay( todayPostKey, oneYearAgoPostKey ) );
			assert( ! sameDay( todayPostKey, oneYearInTheFuturePostKey ) );
			assert( ! sameDay( todayPostKey, oneMonthAgoPostKey ) );
		} );
	} );

	describe( '#sameSite', () => {
		it( 'should return true when two postKeys represent the same site', () => {
			const postId = 'postId';
			const isSame = sameSite(
				{ blogId: 'site1', postId },
				{ blogId: 'site1', postId },
			);
			assert( isSame );
		} );

		it( 'should return true when two postKeys represent the same feed', () => {
			const isSame = sameSite( postKey1, postKey2 );
			assert( isSame );
		} );

		it( 'should return true when samesite and one item is a combinedCard', () => {
			const isSame = sameSite( combinedCardPostKey1, combinedCardPostKey2 );
			assert( isSame );
		} );

		it( 'should return false when different site and one item is a combinedCard', () => {
			const isSame = sameSite(
				{ ...combinedCardPostKey1, feedId: 'feed3' },
				combinedCardPostKey2
			);
			assert( ! isSame );
		} );

		it( 'should work when both postKeys represent combinedCards', () => {
			const isSame = sameSite( combinedCardPostKey1, combinedCardPostKey2 );
			assert( isSame );
		} );

		it( 'recs should never be marked as sameSite', () => {
			const isSame = sameSite(
				{ ...postKey1, isRecommendationBlock: 'isRecommendationBlock', },
				postKey1,
			);
			assert.isNotTrue( isSame );
		} );
	} );

	describe( '#combine', () => {
		it( 'should combine two regular postkeys', () => {
			const combined = combine( postKey1, postKey2 );
			expect( combined ).to.eql( {
				feedId: postKey1.feedId,
				postIds: [ postKey1.postId, postKey2.postId ],
				isCombination: true,
				localMoment: undefined,
			} );
		} );

		it( 'should return null if either postKey is null', () => {
			const combined = combine( postKey1, null );
			assert.equal( combined, null );
		} );

		it( 'should combine a combined card with a regular postKey', () => {
			const combined = combine( combinedCardPostKey1, postKey1 );
			expect( combined ).to.eql( {
				...combinedCardPostKey1,
				postIds: combinedCardPostKey1.postIds.concat( postKey1.postId ),
			} );
		} );

		it( 'should combine two combined cards correctly', () => {
			const combined = combine( combinedCardPostKey1, combinedCardPostKey2 );
			expect( combined ).to.eql( {
				...combinedCardPostKey1,
				postIds: combinedCardPostKey1.postIds.concat( combinedCardPostKey2.postIds ),
			} );
		} );
	} );

	describe( '#combineCards', () => {
		const localMoment = moment();
		const site1Key1 = { blogId: '1', postId: '11', localMoment };
		const site1Key2 = { blogId: '1', postId: '12', localMoment };
		const site1Key3 = { blogId: '1', postId: '13', localMoment };
		const site2Key2 = { blogId: '2', postId: '22', localMoment };
		const site3Key1 = { blogId: '3', postId: '31', localMoment };
		const site4Key1 = { blogId: '4', postId: '41', localMoment };

		it( 'should combine series with 2 in a rows', () => {
			const postKeysSet1 = [ site1Key1, site1Key2 ];
			const combinedItems1 = combineCards( postKeysSet1 );
			expect( combinedItems1 ).eql( [ combine( site1Key1, site1Key2 ) ] );

			const postKeysSet2 = [ site4Key1, site1Key1, site1Key2, site3Key1 ];
			const combinedItems2 = combineCards( postKeysSet2 );
			expect( combinedItems2 ).eql( [
				site4Key1,
				combine( site1Key1, site1Key2 ),
				site3Key1,
			] );
		} );

		it( 'should combine cards with series of 3 in a row', () => {
			const combinedCard = combine( combine( site1Key1, site1Key2 ), site1Key3 );

			const postKeys1 = [ site1Key1, site1Key2, site1Key3 ];
			const combinedItems1 = combineCards( postKeys1 );
			expect( combinedItems1 ).eql( [ combinedCard ] );

			const postKeys2 = [ site4Key1, site1Key1, site1Key2, site1Key3, site3Key1 ];
			const combinedItems2 = combineCards( postKeys2 );
			expect( combinedItems2 ).eql( [
				site4Key1,
				combinedCard,
				site3Key1,
			] );
		} );

		it( 'should not combine any cards when no series exist', () => {
			const postKeys = [ site1Key1, site2Key2, site3Key1, site4Key1 ];
			const combinedItems = combineCards( postKeys );
			expect( combinedItems ).eql( postKeys );
		} );

		it( 'should not combine discover cards', () => {
			const discoverFeedId = 41325786;
			const discoverSiteId = 53424024;
			const discoverFeedPostKeys = [
				{ feedId: discoverFeedId, postId: '1', localMoment: moment(), },
				{ feedId: discoverFeedId, postId: '2', localMoment: moment(), },
			];
			const discoverSitePostKeys = [
				{ blogId: discoverSiteId, postId: '1', localMoment: moment(), },
				{ blogId: discoverSiteId, postId: '2', localMoment: moment(), },
			];
			const combinedFeedItems = combineCards( discoverFeedPostKeys );
			const combinedSiteItems = combineCards( discoverSitePostKeys );

			expect( combinedFeedItems ).eql( discoverFeedPostKeys );
			expect( combinedSiteItems ).eql( discoverSitePostKeys );
		} );

		it( 'should not combine cards that are greater than a day apart', () => {
			const theDistantPast = moment().year( -1 );
			const postKeys = [
				site1Key1,
				{ ...site1Key2, localMoment: theDistantPast },
			];
			const combinedItems = combineCards( postKeys );
			expect( combinedItems ).eql( postKeys );
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

		it( 'should not modify items if empty recs', () => {
			const items = ( [ {} ] );
			const injectedItems = injectRecommendations( items, [], 1 );

			expect( injectedItems ).eql( items );
		} );

		it( 'should not modify items if cards per rec is greater than length of items', () => {
			const recs = [ postKey1, postKey1, postKey1, postKey1 ];
			const items = [ {} ];
			const injectedItems = injectRecommendations( items, recs, 1 );

			expect( injectedItems ).eql( items );
		} );

		it( 'should inject 2 recs for each regular post when cards per rec = 1', () => {
			const recs = [ rec(), rec(), rec(), rec(), rec(), rec(), rec(), rec(), ];
			const items = [ post(), post(), post(), post(), post() ];
			const injectedItems = injectRecommendations( items, recs, 1 );

			expect( injectedItems ).eql( [
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

		it( 'should gracefully run out of recs by inserting until it runs out', () => {
			const recs = [ rec(), rec(), ];
			const items = [ post(), post(), post() ];
			const injectedItems = injectRecommendations( items, recs, 1 );

			expect( injectedItems ).eql( [
				post(),
				createRecBlock( [ rec(), rec() ], 0 ),
				post(),
				post(),
			] );
		} );

		it( 'should inject 2 recs for each 4 regular posts when cards per rec = 4', () => {
			const recs = [ rec(), rec(), ];
			const items = [ post(), post(), post(), post(), post() ];
			const injectedItems = injectRecommendations( items, recs, 4 );

			expect( injectedItems ).eql( [
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
