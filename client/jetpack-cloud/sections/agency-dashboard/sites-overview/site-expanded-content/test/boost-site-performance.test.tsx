/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import BoostSitePerformance from '../boost-site-performance';

describe( 'BoostSitePerformance', () => {
	const boostData = {
		overall: 80,
		mobile: 75,
		desktop: 85,
	};
	const siteId = 123;
	const siteUrlWithScheme = 'https://example.com';
	const trackEventMock = jest.fn();

	test( 'renders the overall score and tooltip', () => {
		const hasBoost = true;

		render(
			<BoostSitePerformance
				boostData={ boostData }
				hasBoost={ hasBoost }
				siteId={ siteId }
				siteUrlWithScheme={ siteUrlWithScheme }
				trackEvent={ trackEventMock }
				hasError={ false }
			/>
		);

		const overallRating = screen.getByText( 'B' );
		expect( overallRating ).toBeInTheDocument();

		const mobileScore = screen.getByText( /75/i );
		expect( mobileScore ).toBeInTheDocument();

		const desktopScore = screen.getByText( /85/i );
		expect( desktopScore ).toBeInTheDocument();
	} );

	test( 'renders the empty content when hasBoost is false', () => {
		const hasBoost = false;
		render(
			<BoostSitePerformance
				boostData={ boostData }
				hasBoost={ hasBoost }
				siteId={ siteId }
				siteUrlWithScheme={ siteUrlWithScheme }
				trackEvent={ trackEventMock }
				hasError={ false }
			/>
		);

		const emptyContent = screen.getByText( /see your site performance scores/i );
		expect( emptyContent ).toBeInTheDocument();
		const strongTag = screen.getByText( /get score/i );
		expect( strongTag ).toHaveStyle( 'font-weight: bold' );
	} );

	test( 'calls trackEvent when button is clicked and checks if the button has href', () => {
		const hasBoost = true;

		render(
			<BoostSitePerformance
				boostData={ boostData }
				hasBoost={ hasBoost }
				siteId={ siteId }
				siteUrlWithScheme={ siteUrlWithScheme }
				trackEvent={ trackEventMock }
				hasError={ false }
			/>
		);

		const button = screen.getByRole( 'link', { name: /optimize css/i } );
		expect( button ).toBeInTheDocument();
		expect( button ).toHaveAttribute(
			'href',
			`${ siteUrlWithScheme }/wp-admin/admin.php?page=jetpack-boost`
		);

		fireEvent.click( button );
		expect( trackEventMock ).toHaveBeenCalledWith( 'expandable_block_optimize_css_click' );
	} );
} );
