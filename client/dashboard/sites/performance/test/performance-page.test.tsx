/**
 * @jest-environment jsdom
 */

import { isEnabled } from '@automattic/calypso-config';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import PerformancePage from '../performance-page';

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn( () => '' );
	return Object.assign( fn, { __esModule: true, default: fn, isEnabled: jest.fn() } );
} );

const mockedIsEnabled = isEnabled as jest.MockedFunction< typeof isEnabled >;

function mockIsAutomattician( isAutomattician: boolean ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/read/teams' )
		.reply( 200, {
			number: isAutomattician ? 1 : 0,
			teams: isAutomattician ? [ { slug: 'a8c', title: 'Automatticians' } ] : [],
		} );
}

describe( '<PerformancePage>', () => {
	test( 'renders one page title and both tabs, with the current tab selected', async () => {
		mockedIsEnabled.mockReturnValue( true );
		mockIsAutomattician( true );

		render(
			<PerformancePage siteSlug="test-site.wordpress.com" tab="backend">
				<div>Server response content</div>
			</PerformancePage>
		);

		expect( await screen.findByRole( 'tab', { name: 'Page speed' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Performance', level: 1 } ) ).toBeVisible();
		expect( screen.getByRole( 'tab', { name: 'Server response' } ) ).toHaveAttribute(
			'aria-selected',
			'true'
		);
		expect( screen.getByText( 'Server response content' ) ).toBeVisible();
	} );

	test( 'hides the tabs when APM is disabled', async () => {
		mockedIsEnabled.mockReturnValue( false );
		mockIsAutomattician( true );

		render(
			<PerformancePage siteSlug="test-site.wordpress.com" tab="frontend">
				<div>Page speed content</div>
			</PerformancePage>
		);

		expect( await screen.findByText( 'Page speed content' ) ).toBeVisible();
		expect( screen.queryByRole( 'tab' ) ).not.toBeInTheDocument();
	} );

	test( 'hides the tabs from users who are not Automatticians', async () => {
		mockedIsEnabled.mockReturnValue( true );
		const teams = mockIsAutomattician( false );

		render(
			<PerformancePage siteSlug="test-site.wordpress.com" tab="frontend">
				<div>Page speed content</div>
			</PerformancePage>
		);

		expect( await screen.findByText( 'Page speed content' ) ).toBeVisible();
		await waitFor( () => expect( teams.isDone() ).toBe( true ) );
		expect( screen.queryByRole( 'tab', { name: 'Server response' } ) ).not.toBeInTheDocument();
	} );
} );
