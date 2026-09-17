/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { TestDomainSearch } from '../../../test-helpers/renderer';
import { NAME_PULSE_SKELETON_TIMEOUT_MS } from '../../helpers';
import { NamePulseResultsSection } from '../results-section';

const skeletonCount = () => document.querySelectorAll( '.name-pulse-row--skeleton' ).length;

describe( 'NamePulseResultsSection', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'shows skeleton slots while loading and drops them after the timeout', () => {
		render(
			<TestDomainSearch>
				<NamePulseResultsSection
					id="suggestions"
					title="More suggestions"
					results={ [] }
					isLoading
					skeletonCount={ 3 }
				/>
			</TestDomainSearch>
		);

		expect( screen.getByText( 'More suggestions' ) ).toBeInTheDocument();
		expect( skeletonCount() ).toBe( 3 );

		act( () => {
			jest.advanceTimersByTime( NAME_PULSE_SKELETON_TIMEOUT_MS - 1 );
		} );
		expect( skeletonCount() ).toBe( 3 );

		act( () => {
			jest.advanceTimersByTime( 1 );
		} );

		// Nothing left to show: the whole section unmounts.
		expect( skeletonCount() ).toBe( 0 );
		expect( screen.queryByText( 'More suggestions' ) ).not.toBeInTheDocument();
	} );
} );
