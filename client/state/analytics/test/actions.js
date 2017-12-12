/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { flowRight, set } from 'lodash';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	composeAnalytics,
	withAnalytics,
	bumpStat,
	setTracksAnonymousUserId,
	recordTracksEvent,
	recordTracksEventWithClientId,
	recordPageView,
	recordPageViewWithClientId,
} from '../actions.js';

import {
	ANALYTICS_MULTI_TRACK,
	ANALYTICS_STAT_BUMP,
	ANALYTICS_TRACKS_ANONID_SET,
} from 'state/action-types';

describe( 'middleware', () => {
	describe( 'actions', () => {
		test( 'should wrap an existing action', () => {
			const testAction = { type: 'RETICULATE_SPLINES' };
			const statBump = bumpStat( 'splines', 'reticulated_count' );
			const expected = Object.assign( statBump, testAction );
			const composite = withAnalytics( statBump, testAction );

			expect( composite ).to.deep.equal( expected );
		} );

		test( 'should trigger analytics and run passed thunks', () => {
			const dispatch = spy();
			const testAction = dispatcher => dispatcher( { type: 'test' } );
			const statBump = bumpStat( 'splines', 'reticulated_count' );

			withAnalytics( statBump, testAction )( dispatch );
			expect( dispatch ).to.have.been.calledTwice;
		} );

		test( 'should compose multiple analytics calls', () => {
			const composite = composeAnalytics(
				bumpStat( 'spline_types', 'ocean' ),
				bumpStat( 'spline_types', 'river' )
			);
			const expected = [
				{
					type: ANALYTICS_STAT_BUMP,
					payload: { group: 'spline_types', name: 'ocean' },
				},
				{
					type: ANALYTICS_STAT_BUMP,
					payload: { group: 'spline_types', name: 'river' },
				},
			];

			expect( composite.type ).to.equal( ANALYTICS_MULTI_TRACK );
			expect( composite.meta.analytics ).to.have.lengthOf( 2 );
			expect( composite.meta.analytics ).to.deep.equal( expected );
		} );

		test( 'should compose multiple analytics calls without other actions', () => {
			const composite = composeAnalytics(
				bumpStat( 'spline_types', 'ocean' ),
				bumpStat( 'spline_types', 'river' )
			);
			const testAction = { type: 'RETICULATE_SPLINES' };
			const actual = withAnalytics( composite, testAction );

			expect( actual.type ).to.equal( testAction.type );
			expect( actual.meta.analytics ).to.have.lengthOf( 2 );
		} );

		test( 'should compose multiple analytics calls with normal actions', () => {
			const composite = flowRight(
				withAnalytics( bumpStat( 'spline_types', 'ocean' ) ),
				withAnalytics( bumpStat( 'spline_types', 'river' ) ),
				() => ( { type: 'RETICULATE_SPLINES' } )
			)();

			expect( composite.meta.analytics ).to.have.lengthOf( 2 );
		} );

		test( 'should allow setting Tracks anonymous ID', () => {
			const tracksAction = setTracksAnonymousUserId( 'abcd1234' );
			const expected = [
				{
					type: ANALYTICS_TRACKS_ANONID_SET,
					payload: 'abcd1234',
				},
			];
			expect( tracksAction.type ).to.equal( ANALYTICS_TRACKS_ANONID_SET );
			expect( tracksAction.meta.analytics ).to.deep.equal( expected );
		} );
	} );

	describe( 'withClientId', () => {
		test( 'should create track event with client id', () => {
			const props = [
				'calypso_login_success',
				{
					hello: 'world',
				},
			];
			const tracksEvent = recordTracksEvent( ...props );
			const thunk = recordTracksEventWithClientId( ...props );
			const clientId = 123;

			thunk(
				event => {
					set( tracksEvent, 'meta.analytics[0].payload.client_id', clientId );

					expect( event ).to.eql( tracksEvent );
				},
				() => ( {
					ui: { oauth2Clients: { currentClientId: clientId } },
				} )
			);
		} );

		test( 'should create page view event with client id', () => {
			const props = [
				'calypso_login_success',
				{
					hello: 'world',
				},
			];
			const clientId = 123;
			const pageViewEvent = recordPageView( ...props );
			const thunk = recordPageViewWithClientId( ...props );

			thunk(
				event => {
					set( pageViewEvent, 'meta.analytics[0].payload.client_id', clientId );

					expect( event ).to.eql( pageViewEvent );
				},
				() => ( {
					ui: { oauth2Clients: { currentClientId: clientId } },
				} )
			);
		} );
	} );
} );
