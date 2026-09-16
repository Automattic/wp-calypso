/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { TestDomainSearch } from '../../../test-helpers/renderer';
import {
	NAME_PULSE_SKELETON_TIMEOUT_MS,
	NamePulseDomainStatus,
	type NamePulseDomainResult,
} from '../../helpers';
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
				id="suggestions"
				title="More suggestions"
				results={ [] }
				searchKey="coffee shop"
				{ ...props }
			/>
		</TestDomainSearch>
	);

const skeletonCount = () => document.querySelectorAll( '.name-pulse-row--skeleton' ).length;

describe( 'NamePulseResultsSection skeleton timeout', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'shows skeleton slots while loading and drops them after the timeout', () => {
		renderSection( { isLoading: true, skeletonCount: 3 } );

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
					id="suggestions"
					title="More suggestions"
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
					id="suggestions"
					title="More suggestions"
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

describe( 'NamePulseResultsSection show more', () => {
	it( 'reveals another page and reports the revealed rows', () => {
		const results = Array.from( { length: 30 }, ( _, i ) => row( `coffee${ i }.com` ) );
		const onReveal = jest.fn();

		renderSection( { results, showMoreLabel: 'Show more exact matches', onReveal } );

		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( 12 );

		act( () => {
			screen.getByRole( 'button', { name: 'Show more exact matches' } ).click();
		} );

		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( 24 );
		expect( onReveal ).toHaveBeenCalledWith( results.slice( 12, 24 ) );
	} );

	it( 'never shows more than the hard cap', () => {
		const results = Array.from( { length: 10 }, ( _, i ) => row( `coffee${ i }.com` ) );

		renderSection( { results, maxVisible: 3, showMoreLabel: 'Show more' } );

		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( 3 );
		expect( screen.queryByRole( 'button', { name: 'Show more' } ) ).not.toBeInTheDocument();
	} );
} );
