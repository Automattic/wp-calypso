/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { useViewportMatch } from '@wordpress/compose';
import { TestDomainSearch } from '../../../test-helpers/renderer';
import { NAME_PULSE_SKELETON_TIMEOUT_MS } from '../../helpers';
import { NamePulseResultsSection } from '../results-section';

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

const mockUseViewportMatch = jest.mocked( useViewportMatch );

const skeletonCount = () => document.querySelectorAll( '.name-pulse-row--skeleton' ).length;

describe( 'NamePulseResultsSection', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		mockUseViewportMatch.mockReturnValue( false );
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

	it( 'lays the skeleton slots out as cards in the card variant', () => {
		render(
			<TestDomainSearch>
				<NamePulseResultsSection
					id="top"
					title="Top results"
					results={ [] }
					isLoading
					skeletonCount={ 3 }
					variant="card"
				/>
			</TestDomainSearch>
		);

		expect( document.querySelector( '.name-pulse-grid--cards' ) ).toBeInTheDocument();
		expect(
			document.querySelectorAll( '.name-pulse-row--skeleton.name-pulse-row--card' )
		).toHaveLength( 3 );
	} );

	it( 'keeps the table layout for the card variant on phones', () => {
		mockUseViewportMatch.mockImplementation(
			( breakpoint, operator ) => breakpoint === 'small' && operator === '<'
		);

		render(
			<TestDomainSearch>
				<NamePulseResultsSection
					id="top"
					title="Top results"
					results={ [] }
					isLoading
					skeletonCount={ 3 }
					variant="card"
				/>
			</TestDomainSearch>
		);

		expect( skeletonCount() ).toBe( 3 );
		expect( document.querySelector( '.name-pulse-grid--cards' ) ).not.toBeInTheDocument();
		expect( document.querySelector( '.name-pulse-row--card' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the table layout by default', () => {
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

		expect( document.querySelector( '.name-pulse-grid' ) ).toBeInTheDocument();
		expect( document.querySelector( '.name-pulse-grid--cards' ) ).not.toBeInTheDocument();
		expect( document.querySelector( '.name-pulse-row--card' ) ).not.toBeInTheDocument();
	} );
} );
