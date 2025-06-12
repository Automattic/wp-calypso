/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { site } from '../../test/test-utils/constants';
import InsightsStats from '../insights-stats';

describe( 'InsightsStats', () => {
	const stats = site.site_stats;
	const trackEventMock = jest.fn();

	beforeEach( () => {
		render(
			<InsightsStats
				stats={ stats }
				siteUrlWithScheme={ site.url_with_scheme }
				trackEvent={ trackEventMock }
			/>
		);
	} );

	test( 'renders the Visitors stats with the up trend', () => {
		const visitorsTitle = screen.getByText( /Visitors/i );
		const visitorsTotal = screen.getByText( /1k/i );
		const visitorsTrend = screen.getByText( /50/i );

		expect( visitorsTitle ).toBeInTheDocument();
		expect( visitorsTotal ).toBeInTheDocument();
		expect( visitorsTrend ).toBeInTheDocument();
		expect( visitorsTrend.parentElement ).toHaveClass( 'is-up' );
	} );

	test( 'renders the Views stats with the down trend', () => {
		const viewsTitle = screen.getByText( /Views/i );
		const viewsTotal = screen.getByText( /5k/i );
		const viewsTrend = screen.getByText( /100/i );

		expect( viewsTitle ).toBeInTheDocument();
		expect( viewsTotal ).toBeInTheDocument();
		expect( viewsTrend ).toBeInTheDocument();
		expect( viewsTrend.parentElement ).toHaveClass( 'is-down' );
	} );

	test( 'clicking on the See all stats button triggers the trackEvent callback', () => {
		const seeAllStatsButton = screen.getByRole( 'link', { name: /See all stats/i } );

		fireEvent.click( seeAllStatsButton );

		expect( trackEventMock ).toHaveBeenCalledWith( 'expandable_block_see_all_stats_click' );
	} );
} );
