/**
 * External dependencies
 */
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { PageViewTracker } from '../';
import useFakeDom from 'test/helpers/use-fake-dom';
import { useFakeTimers } from 'test/helpers/use-sinon';

describe( 'PageViewTracker', () => {
	let clock;

	useFakeDom();
	useFakeTimers( fakeClock => {
		clock = fakeClock;
	} );

	it( 'should immediately fire off event when given no delay', () => {
		const recorder = spy();

		mount( <PageViewTracker path="/test" title="test" recorder={ recorder } /> );

		expect( recorder ).to.have.been.calledOnce;
	} );

	it( 'should wait for the delay before firing off the event', () => {
		const recorder = spy();

		mount( <PageViewTracker delay={ 500 } path="/test" title="test" recorder={ recorder } /> );

		expect( recorder ).to.not.have.been.called;

		clock.tick( 500 );

		expect( recorder ).to.have.been.calledOnce;
	} );

	it( 'should pass the appropriate event information', () => {
		const recorder = spy();

		mount( <PageViewTracker path="/test" title="test" recorder={ recorder } /> );

		expect( recorder ).to.have.been.calledWith( '/test', 'test' );
	} );
} );
