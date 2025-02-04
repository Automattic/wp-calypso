/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { UnconnectedPageViewTracker as PageViewTracker } from '../';

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

		render(
			<PageViewTracker path="/test" title="test" recorder={ recorder } hasSelectedSiteLoaded />
		);

		expect( recorder ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should wait for the delay before firing off the event', () => {
		const recorder = jest.fn();

		render(
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

		render(
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
