/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { site } from '../../test/test-utils/constants';
import BoostSitePerformance from '../boost-site-performance';

describe( 'BoostSitePerformance', () => {
	const trackEventMock = jest.fn();

	test( 'renders the overall score and tooltip', () => {
		render(
			<BoostSitePerformance site={ site } trackEvent={ trackEventMock } hasError={ false } />
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
		render( <BoostSitePerformance { ...props } /> );

		const emptyContent = screen.getByText( /see your site performance scores/i );
		expect( emptyContent ).toBeInTheDocument();
		const strongTag = screen.getByText( /get score/i );
		expect( strongTag ).toHaveStyle( 'font-weight: bold' );
	} );

	test( 'renders the Optimize css button when there is a score and has boost', () => {
		render(
			<BoostSitePerformance site={ site } trackEvent={ trackEventMock } hasError={ false } />
		);

		const button = screen.getByRole( 'link', { name: /optimize css/i } );
		expect( button ).toBeInTheDocument();
		expect( button ).toHaveAttribute(
			'href',
			`${ site.url_with_scheme }/wp-admin/admin.php?page=jetpack-boost`
		);

		fireEvent.click( button );
		expect( trackEventMock ).toHaveBeenCalledWith( 'expandable_block_optimize_css_click' );
	} );

	test( 'renders the Configure Boost button when there is a score and has no boost', () => {
		const props = {
			site: {
				...site,
				has_boost: false,
			},
			trackEvent: trackEventMock,
			hasError: false,
		};
		render( <BoostSitePerformance { ...props } /> );

		const button = screen.getByRole( 'link', { name: /configure boost/i } );
		expect( button ).toBeInTheDocument();
		expect( button ).toHaveAttribute(
			'href',
			`${ site.url_with_scheme }/wp-admin/admin.php?page=my-jetpack#/add-boost`
		);

		fireEvent.click( button );
		expect( trackEventMock ).toHaveBeenCalledWith( 'expandable_block_configure_boost_click' );
	} );
} );
