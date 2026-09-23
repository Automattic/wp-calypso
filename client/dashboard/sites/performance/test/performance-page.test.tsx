/**
 * @jest-environment jsdom
 */

import { isEnabled } from '@automattic/calypso-config';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import PerformancePage from '../performance-page';

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn( () => '' );
	return Object.assign( fn, { __esModule: true, default: fn, isEnabled: jest.fn() } );
} );

const mockedIsEnabled = isEnabled as jest.MockedFunction< typeof isEnabled >;

describe( '<PerformancePage>', () => {
	test( 'renders one page title and both tabs, with the current tab selected', async () => {
		mockedIsEnabled.mockReturnValue( true );

		render(
			<PerformancePage siteSlug="test-site.wordpress.com" tab="backend">
				<div>Server response content</div>
			</PerformancePage>
		);

		expect( await screen.findByRole( 'heading', { name: 'Performance', level: 1 } ) ).toBeVisible();
		expect( screen.getByRole( 'tab', { name: 'Page speed' } ) ).toBeVisible();
		expect( screen.getByRole( 'tab', { name: 'Server response' } ) ).toHaveAttribute(
			'aria-selected',
			'true'
		);
		expect( screen.getByText( 'Server response content' ) ).toBeVisible();
	} );

	test( 'hides the tabs when APM is disabled', async () => {
		mockedIsEnabled.mockReturnValue( false );

		render(
			<PerformancePage siteSlug="test-site.wordpress.com" tab="frontend">
				<div>Page speed content</div>
			</PerformancePage>
		);

		expect( await screen.findByText( 'Page speed content' ) ).toBeVisible();
		expect( screen.queryByRole( 'tab' ) ).not.toBeInTheDocument();
	} );
} );
