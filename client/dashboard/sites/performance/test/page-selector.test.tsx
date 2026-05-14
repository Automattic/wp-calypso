/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import PageSelector from '../page-selector';
import type { SitePerformancePage } from '@automattic/api-core';

const siteUrl = 'https://example.com';
const onChange = jest.fn();

describe( '<PageSelector>', () => {
	test( 'shows fallback text when page title is null', () => {
		const page = {
			id: '1',
			link: 'https://example.com/about',
			title: null,
			wpcom_performance_report_hash: '',
		} as unknown as SitePerformancePage;

		render(
			<PageSelector
				siteUrl={ siteUrl }
				pages={ [ page ] }
				currentPage={ page }
				onChange={ onChange }
			/>
		);

		expect( screen.getByText( 'No title' ) ).toBeVisible();
	} );

	test( 'shows fallback text when page title rendered is empty string', () => {
		const page = {
			id: '2',
			link: 'https://example.com/contact',
			title: { rendered: '' },
			wpcom_performance_report_hash: '',
		} as SitePerformancePage;

		render(
			<PageSelector
				siteUrl={ siteUrl }
				pages={ [ page ] }
				currentPage={ page }
				onChange={ onChange }
			/>
		);

		expect( screen.getByText( 'No title' ) ).toBeVisible();
	} );

	test( 'shows page title when it is provided', () => {
		const page = {
			id: '3',
			link: 'https://example.com/about',
			title: { rendered: 'About Us' },
			wpcom_performance_report_hash: '',
		} as SitePerformancePage;

		render(
			<PageSelector
				siteUrl={ siteUrl }
				pages={ [ page ] }
				currentPage={ page }
				onChange={ onChange }
			/>
		);

		expect( screen.getByText( 'About Us' ) ).toBeVisible();
	} );
} );
