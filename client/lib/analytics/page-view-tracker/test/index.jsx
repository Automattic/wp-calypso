/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { UnconnectedPageViewTracker as PageViewTracker } from '../';

describe( 'PageViewTracker', () => {
	beforeEach( () => {
		vi.useFakeTimers();
	} );

	afterEach( () => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	} );

	test( 'should immediately fire off event when given no delay', () => {
		const recorder = vi.fn();

		render(
			<PageViewTracker path="/test" title="test" recorder={ recorder } hasSelectedSiteLoaded />
		);

		expect( recorder ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should wait for the delay before firing off the event', () => {
		const recorder = vi.fn();

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

		vi.advanceTimersByTime( 500 );

		expect( recorder ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should pass the appropriate event information', () => {
		const recorder = vi.fn();
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
