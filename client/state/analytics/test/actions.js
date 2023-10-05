import { ANALYTICS_MULTI_TRACK, ANALYTICS_STAT_BUMP } from 'calypso/state/action-types';
import {
	composeAnalytics,
	withAnalytics,
	bumpStat,
	recordTracksEvent,
	recordTracksEventWithClientId,
	recordPageView,
	recordPageViewWithClientId,
} from '../actions';

describe( 'middleware', () => {
	describe( 'actions', () => {
		test( 'should wrap an existing action', () => {
			const testAction = { type: 'RETICULATE_SPLINES' };
			const statBump = bumpStat( 'splines', 'reticulated_count' );
			const expected = Object.assign( statBump, testAction );
			const composite = withAnalytics( statBump, testAction );

			expect( composite ).toEqual( expected );
		} );

		test( 'should trigger analytics and run passed thunks', () => {
			const dispatch = jest.fn();
			const testAction = ( dispatcher ) => dispatcher( { type: 'test' } );
			const statBump = bumpStat( 'splines', 'reticulated_count' );

			withAnalytics( statBump, testAction )( dispatch );
			expect( dispatch ).toHaveBeenCalledTimes( 2 );
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

			expect( composite.type ).toEqual( ANALYTICS_MULTI_TRACK );
			expect( composite.meta.analytics ).toHaveLength( 2 );
			expect( composite.meta.analytics ).toEqual( expected );
		} );

		test( 'should compose multiple analytics calls without other actions', () => {
			const composite = composeAnalytics(
				bumpStat( 'spline_types', 'ocean' ),
				bumpStat( 'spline_types', 'river' )
			);
			const testAction = { type: 'RETICULATE_SPLINES' };
			const actual = withAnalytics( composite, testAction );

			expect( actual.type ).toEqual( testAction.type );
			expect( actual.meta.analytics ).toHaveLength( 2 );
		} );

		test( 'should compose multiple analytics calls with normal actions', () => {
			const action = { type: 'RETICULATE_SPLINES' };
			const composite = withAnalytics( bumpStat( 'spline_types', 'ocean' ) )(
				withAnalytics( bumpStat( 'spline_types', 'river' ) )( action )
			);

			expect( composite.meta.analytics ).toHaveLength( 2 );
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

			let dispatchedEvent;
			const dispatch = ( createdAction ) => ( dispatchedEvent = createdAction );

			const clientId = 123;
			const getState = () => ( {
				oauth2Clients: { ui: { currentClientId: clientId } },
			} );

			thunk( dispatch, getState );

			tracksEvent.meta.analytics[ 0 ].payload.properties.client_id = clientId;

			expect( dispatchedEvent ).toEqual( tracksEvent );
		} );

		test( 'should create page view event with client id', () => {
			const props = [
				'calypso_login_success',
				{
					hello: 'world',
				},
			];

			const pageViewEvent = recordPageView( ...props );
			const thunk = recordPageViewWithClientId( ...props );

			let dispatchedEvent;
			const dispatch = ( createdAction ) => ( dispatchedEvent = createdAction );

			const clientId = 123;
			const getState = () => ( {
				oauth2Clients: { ui: { currentClientId: clientId } },
			} );

			thunk( dispatch, getState );

			pageViewEvent.meta.analytics[ 0 ].payload.client_id = clientId;

			expect( dispatchedEvent ).toEqual( pageViewEvent );
		} );
	} );
} );
