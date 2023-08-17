/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SiteErrorContent from '../site-error-content';

jest.mock( 'react-redux' );

describe( '<SiteErrorContent>', () => {
	test( 'shows a "Fix now" link that points to the correct page', () => {
		const SITE_SLUG = 'test.jurassic.ninja';

		render( <SiteErrorContent siteUrl={ SITE_SLUG } /> );

		const fixNowButton = screen.queryByText( 'Fix now' );
		expect( fixNowButton ).toBeInTheDocument();

		expect( ( fixNowButton as HTMLElement ).getAttribute( 'href' ) ).toEqual(
			`/settings/disconnect-site/${ SITE_SLUG }?type=down`
		);
	} );

	test( 'records the correct Tracks event when the "Fix now" button is clicked', async () => {
		const mockDispatch = jest.fn();
		( useDispatch as jest.Mock< typeof useDispatch > ).mockReturnValue( mockDispatch );

		const user = userEvent.setup();

		render( <SiteErrorContent siteUrl="doesnotmatter" /> );

		const fixNowButton = screen.queryByText( 'Fix now' );
		expect( fixNowButton ).toBeInTheDocument();

		// Suppress actual navigation, because jest-jsdom throws errors
		( fixNowButton as HTMLElement ).addEventListener( 'click', ( e ) => {
			e.preventDefault();
		} );

		await user.click( fixNowButton as HTMLElement );

		const expectedEventAction = recordTracksEvent(
			'calypso_jetpack_agency_dashboard_fix_connection_click'
		);
		expect( mockDispatch ).toBeCalledWith( expectedEventAction );
	} );
} );
