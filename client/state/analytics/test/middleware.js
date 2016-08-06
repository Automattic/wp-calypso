import { expect } from 'chai';
import { spy } from 'sinon';

import useMockery from 'test/helpers/use-mockery';

import {
	withAnalytics,
	bumpStat,
	recordGoogleEvent,
	recordGooglePageView,
	recordTracksEvent,
	recordPageView
} from '../actions';
import analyticsMock from './helpers/analytics-mock';

describe( 'middleware', () => {
	describe( 'analytics dispatching', () => {
		const mock = spy();
		let dispatch;

		useMockery( mockery => {
			mockery.registerMock( 'lib/analytics', analyticsMock( mock ) );

			dispatch = require( '../middleware.js' ).dispatcher;
		} );

		beforeEach( () => mock.reset() );

		it( 'should call mc.bumpStat', () => {
			dispatch( bumpStat( 'test', 'value' ) );

			expect( mock ).to.have.been.calledWith( 'mc.bumpStat' );
		} );

		it( 'should call tracks.recordEvent', () => {
			dispatch( recordTracksEvent( 'test', { name: 'value' } ) );

			expect( mock ).to.have.been.calledWith( 'tracks.recordEvent' );
		} );

		it( 'should call pageView.record', () => {
			dispatch( recordPageView( 'path', 'title' ) );

			expect( mock ).to.have.been.calledWith( 'pageView.record' );
		} );

		it( 'should call ga.recordEvent', () => {
			dispatch( recordGoogleEvent( 'category', 'action' ) );

			expect( mock ).to.have.been.calledWith( 'ga.recordEvent' );
		} );

		it( 'should call ga.recordPageView', () => {
			dispatch( recordGooglePageView( 'path', 'title' ) );

			expect( mock ).to.have.been.calledWith( 'ga.recordPageView' );
		} );

		it( 'should call tracks.recordEvent', () => {
			dispatch( recordTracksEvent( 'event', { name: 'value' } ) );

			expect( mock ).to.have.been.calledWith( 'tracks.recordEvent' );
		} );

		it( 'should call analytics events with wrapped actions', () => {
			dispatch( withAnalytics( bumpStat( 'name', 'value' ), { type: 'TEST_ACTION' } ) );

			expect( mock ).to.have.been.calledWith( 'mc.bumpStat' );
		} );
	} );
} );
