/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { site } from '../../test/test-utils/constants';
import BoostSitePerformance from '../boost-site-performance';

describe( 'BoostSitePerformance', () => {
	const trackEventMock = jest.fn();

	const initialState = {
		partnerPortal: {
			partner: {
				current: {
					can_issue_licenses: true,
				},
			},
		},
	};

	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	const Wrapper = ( { children } ) => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		</Provider>
	);

	test( 'renders the overall score and tooltip', () => {
		render(
			<BoostSitePerformance site={ site } trackEvent={ trackEventMock } hasError={ false } />,
			{
				wrapper: Wrapper,
			}
		);

		const overallRating = screen.getByText( 'B' );
		expect( overallRating ).toBeInTheDocument();

		const mobileScore = screen.getByText( /75/i );
		expect( mobileScore ).toBeInTheDocument();

		const desktopScore = screen.getByText( /85/i );
		expect( desktopScore ).toBeInTheDocument();
	} );

	test( 'renders the empty content when there is no score and no boost', () => {
		const props = {
			site: {
				...site,
				has_boost: false,
				jetpack_boost_scores: { overall: 0, mobile: 0, desktop: 0 },
			},
			trackEvent: trackEventMock,
			hasError: false,
		};
		render( <BoostSitePerformance { ...props } />, {
			wrapper: Wrapper,
		} );

		const emptyContent = screen.getByText( /see your site performance scores/i );
		expect( emptyContent ).toBeInTheDocument();
		const strongTag = screen.getByText( /get score/i );
		expect( strongTag ).toHaveStyle( 'font-weight: bold' );
	} );

	test( "renders the 'Upgrade to auto-optimize' and 'Settings' buttons when there is a score and has no boost", () => {
		const props = {
			site: {
				...site,
				has_boost: false,
				jetpack_boost_scores: { overall: 90, mobile: 90, desktop: 90 },
			},
			trackEvent: trackEventMock,
			hasError: false,
		};

		render( <BoostSitePerformance { ...props } />, {
			wrapper: Wrapper,
		} );

		const autoOptimizeButton = screen.getByText( /Upgrade to auto-optimize/i );
		expect( autoOptimizeButton ).toBeInTheDocument();

		const settingsButton = screen.getByRole( 'link', { name: /settings/i } );
		expect( settingsButton ).toBeInTheDocument();
		expect( settingsButton ).toHaveAttribute(
			'href',
			`${ site.url_with_scheme }/wp-admin/admin.php?page=my-jetpack`
		);

		fireEvent.click( settingsButton );
		expect( trackEventMock ).toHaveBeenCalledWith( 'boost_expandable_block_settings_click' );
	} );

	test( 'renders the Boost settings button when there is a high score and has boost', () => {
		const props = {
			site: {
				...site,
				has_boost: true,
				jetpack_boost_scores: { overall: 95, mobile: 95, desktop: 95 },
			},
			trackEvent: trackEventMock,
			hasError: false,
		};
		render( <BoostSitePerformance { ...props } />, {
			wrapper: Wrapper,
		} );

		const button = screen.getByRole( 'link', { name: /boost settings/i } );
		expect( button ).toBeInTheDocument();
		expect( button ).toHaveAttribute(
			'href',
			`${ site.url_with_scheme }/wp-admin/admin.php?page=jetpack-boost`
		);

		fireEvent.click( button );
		expect( trackEventMock ).toHaveBeenCalledWith( 'boost_expandable_block_boost_settings_click' );
	} );

	test( 'renders the Boost settings button when there is a low score and has boost', () => {
		const props = {
			site: {
				...site,
				has_boost: true,
				jetpack_boost_scores: { overall: 50, mobile: 50, desktop: 50 },
			},
			trackEvent: trackEventMock,
			hasError: false,
		};
		render( <BoostSitePerformance { ...props } />, {
			wrapper: Wrapper,
		} );

		const button = screen.getByRole( 'link', { name: /optimize performance/i } );
		expect( button ).toBeInTheDocument();
		expect( button ).toHaveAttribute(
			'href',
			`${ site.url_with_scheme }/wp-admin/admin.php?page=jetpack-boost`
		);

		fireEvent.click( button );
		expect( trackEventMock ).toHaveBeenCalledWith(
			'boost_expandable_block_optimize_performance_click'
		);
	} );
} );
