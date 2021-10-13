/**
 * @jest-environment jsdom
 */

import { expect } from 'chai';
import { mount } from 'enzyme';
import { spy } from 'sinon';
import { useFakeTimers } from 'calypso/test-helpers/use-sinon';
import { PageViewTracker } from '../';

describe( 'PageViewTracker', () => {
	let clock;

	useFakeTimers( ( fakeClock ) => {
		clock = fakeClock;
	} );

	test( 'should immediately fire off event when given no delay', () => {
		const recorder = spy();

		mount(
			<PageViewTracker path="/test" title="test" recorder={ recorder } hasSelectedSiteLoaded />
		);

		expect( recorder ).to.have.been.calledOnce;
	} );

	test( 'should wait for the delay before firing off the event', () => {
		const recorder = spy();

		mount(
			<PageViewTracker
				delay={ 500 }
				path="/test"
				title="test"
				recorder={ recorder }
				hasSelectedSiteLoaded
			/>
		);

		expect( recorder ).to.not.have.been.called;

		clock.tick( 500 );

		expect( recorder ).to.have.been.calledOnce;
	} );

	test( 'should pass the appropriate event information', () => {
		const recorder = spy();

		mount(
			<PageViewTracker path="/test" title="test" recorder={ recorder } hasSelectedSiteLoaded />
		);

		expect( recorder ).to.have.been.calledWith( '/test', 'test' );
	} );
} );
