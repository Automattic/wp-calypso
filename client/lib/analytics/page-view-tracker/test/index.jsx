/**
 * @jest-environment jsdom
 */
import { mount } from 'enzyme';
import { PageViewTracker } from '../';

describe( 'PageViewTracker', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	} );

	test( 'should immediately fire off event when given no delay', () => {
		const recorder = jest.fn();

		mount(
			<PageViewTracker path="/test" title="test" recorder={ recorder } hasSelectedSiteLoaded />
		);

		expect( recorder ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should wait for the delay before firing off the event', () => {
		const recorder = jest.fn();

		mount(
			<PageViewTracker
				delay={ 500 }
				path="/test"
				title="test"
				recorder={ recorder }
				hasSelectedSiteLoaded
			/>
		);

		expect( recorder ).not.toHaveBeenCalled();

		jest.advanceTimersByTime( 500 );

		expect( recorder ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should pass the appropriate event information', () => {
		const recorder = jest.fn();
		const properties = {};
		const options = {};

		mount(
			<PageViewTracker
				path="/test"
				title="test"
				properties={ properties }
				options={ options }
				recorder={ recorder }
				hasSelectedSiteLoaded
			/>
		);

		expect( recorder ).toHaveBeenCalledWith( '/test', 'test', 'default', properties, options );
	} );
} );
