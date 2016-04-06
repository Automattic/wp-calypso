import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';

import useFakeDom from 'test/helpers/use-fake-dom';
import { useFakeTimers } from 'test/helpers/use-sinon';

import PageViewTracker from 'analytics/page-view-tracker/component';

describe( 'PageViewTracker', () => {
	let clock;

	useFakeDom();
	useFakeTimers( fakeClock => {
		clock = fakeClock
	} );

	it( 'should immediately fire off event when given no delay', done => {
		const state = { value: false };
		const Tracker = PageViewTracker( () => { state.value = true; } );

		mount( <Tracker path="/test" title="test" /> );

		expect( state.value ).to.be.true;

		done();
	} );

	it( 'should wait for the delay before firing off the event', done => {
		const state = { value: false };
		const Tracker = PageViewTracker( () => { state.value = true; } );

		mount( <Tracker delay={ 500 } path="/test" title="test" /> );

		expect( state.value ).to.be.false;

		clock.tick( 250 );

		expect( state.value ).to.be.false;

		clock.tick( 250 );

		expect( state.value ).to.be.true;

		done();
	} );

	it( 'should pass the appropriate event information', done => {
		const Tracker = PageViewTracker( ( path, title ) => {
			expect( path ).to.equal( '/test' );
			expect( title ).to.equal( 'test' );

			done();
		} );

		mount( <Tracker path="/test" title="test" /> );

		clock.tick( 10 );
	} );
} );
