/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SitesAddNewSitePopover } from '../index';

// Mock dependencies
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
	localize: ( x ) => x,
} ) );

// Mock the AsyncContent component to avoid loading issues in tests
jest.mock( '../async', () => ( {
	AsyncContent: () => <div data-testid="async-content">Async Content</div>,
} ) );

describe( 'SitesAddNewSitePopover', () => {
	const sitesDashboardContext = 'sites-dashboard';

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders with full label when not in compact mode', () => {
		render( <SitesAddNewSitePopover showCompact={ false } context={ sitesDashboardContext } /> );
		expect( screen.getByText( 'Add new site' ) ).toBeInTheDocument();
	} );

	it( 'renders without label in compact mode', () => {
		render( <SitesAddNewSitePopover showCompact context={ sitesDashboardContext } /> );
		expect( screen.queryByText( 'Add new site' ) ).not.toBeInTheDocument();
	} );

	it( 'tracks event when dropdown is opened', () => {
		render( <SitesAddNewSitePopover showCompact={ false } context={ sitesDashboardContext } /> );
		const button = screen.getByRole( 'button' );
		fireEvent.click( button );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_sites_dashboard_new_site_action_click_open'
		);
	} );

	it( 'closes popover when clicking the button again', async () => {
		render( <SitesAddNewSitePopover showCompact={ false } context={ sitesDashboardContext } /> );
		const button = screen.getByRole( 'button' );
		fireEvent.click( button );
		expect( screen.getByTestId( 'async-content' ) ).toBeInTheDocument();

		// Click button again
		fireEvent.click( button );
		await waitFor( () => {
			expect( screen.queryByTestId( 'async-content' ) ).not.toBeInTheDocument();
		} );
	} );
} );
