/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import {
	NAME_PULSE_SKELETON_TIMEOUT_MS,
	NamePulseDomainStatus,
	type NamePulseDomainResult,
} from '../../../helpers/name-pulse';
import { TestDomainSearch } from '../../../test-helpers/renderer';
import { NamePulseResultsSection } from '../results-section';

const row = ( domain_name: string ): NamePulseDomainResult => ( {
	domain_name,
	suffix: 'com',
	status: NamePulseDomainStatus.AVAILABLE,
	cost: '$22.00',
	source: 'keyword',
} );

const renderSection = (
	props: Partial< React.ComponentProps< typeof NamePulseResultsSection > >
) =>
	render(
		<TestDomainSearch>
			<NamePulseResultsSection
				id="related"
				title="Related matches"
				results={ [] }
				searchKey="coffee shop"
				{ ...props }
			/>
		</TestDomainSearch>
	);

const skeletonCount = () => document.querySelectorAll( '.name-pulse-card--skeleton' ).length;

describe( 'NamePulseResultsSection skeleton timeout', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'shows skeleton slots while loading and drops them after the timeout', () => {
		renderSection( { isLoading: true, skeletonCount: 3 } );

		expect( screen.getByText( 'Related matches' ) ).toBeInTheDocument();
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
		expect( screen.queryByText( 'Related matches' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the rows that did arrive when the skeletons time out', () => {
		renderSection( { isLoading: true, skeletonCount: 3, results: [ row( 'coffee.com' ) ] } );

		expect( skeletonCount() ).toBe( 2 );

		act( () => {
			jest.advanceTimersByTime( NAME_PULSE_SKELETON_TIMEOUT_MS );
		} );

		expect( skeletonCount() ).toBe( 0 );
		expect( screen.getByText( 'coffee' ) ).toBeInTheDocument();
	} );

	it( 'restarts the timer for a new search', () => {
		const { rerender } = renderSection( { isLoading: true, skeletonCount: 3 } );

		act( () => {
			jest.advanceTimersByTime( NAME_PULSE_SKELETON_TIMEOUT_MS );
		} );
		expect( skeletonCount() ).toBe( 0 );

		rerender(
			<TestDomainSearch>
				<NamePulseResultsSection
					id="related"
					title="Related matches"
					results={ [] }
					searchKey="tea shop"
					isLoading
					skeletonCount={ 3 }
				/>
			</TestDomainSearch>
		);

		expect( skeletonCount() ).toBe( 3 );
	} );

	it( 'does not time out once loading has finished', () => {
		const { rerender } = renderSection( { isLoading: true, skeletonCount: 3 } );

		rerender(
			<TestDomainSearch>
				<NamePulseResultsSection
					id="related"
					title="Related matches"
					results={ [ row( 'coffee.com' ) ] }
					searchKey="coffee shop"
					isLoading={ false }
					skeletonCount={ 3 }
				/>
			</TestDomainSearch>
		);

		act( () => {
			jest.advanceTimersByTime( NAME_PULSE_SKELETON_TIMEOUT_MS * 2 );
		} );

		expect( skeletonCount() ).toBe( 0 );
		expect( screen.getByText( 'coffee' ) ).toBeInTheDocument();
	} );
} );
