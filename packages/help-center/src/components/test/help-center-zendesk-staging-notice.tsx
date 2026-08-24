/**
 * @jest-environment jsdom
 */

import { isTestModeEnvironment } from '@automattic/zendesk-client';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ZendeskStagingNotice } from '../help-center-zendesk-staging-notice';

jest.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: jest.fn(),
} ) );

const mockIsTestModeEnvironment = isTestModeEnvironment as jest.Mock;

const DISMISSED_STORAGE_KEY = 'help-center-zendesk-staging-notice-dismissed';

function renderNotice( pathname = '/odie' ) {
	return render(
		<MemoryRouter initialEntries={ [ { pathname } ] }>
			<ZendeskStagingNotice />
		</MemoryRouter>
	);
}

describe( 'ZendeskStagingNotice', () => {
	afterEach( () => {
		mockIsTestModeEnvironment.mockReset();
		window.localStorage.clear();
	} );

	it( 'renders when in an Odie chat against Zendesk staging', () => {
		mockIsTestModeEnvironment.mockReturnValue( true );

		renderNotice();

		expect( screen.getByText( 'You’re on Zendesk staging' ) ).toBeVisible();
	} );

	it( 'renders nothing outside the Odie chat', () => {
		mockIsTestModeEnvironment.mockReturnValue( true );

		const { container } = renderNotice( '/' );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing when not running against Zendesk staging', () => {
		mockIsTestModeEnvironment.mockReturnValue( false );

		const { container } = renderNotice();

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing when previously dismissed', () => {
		mockIsTestModeEnvironment.mockReturnValue( true );
		window.localStorage.setItem( DISMISSED_STORAGE_KEY, 'true' );

		const { container } = renderNotice();

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'persists dismissal across sessions when dismissed', async () => {
		mockIsTestModeEnvironment.mockReturnValue( true );
		const user = userEvent.setup();

		renderNotice();

		await user.click( screen.getByLabelText( 'Dismiss' ) );

		expect( screen.queryByText( 'You’re on Zendesk staging' ) ).not.toBeInTheDocument();
		expect( window.localStorage.getItem( DISMISSED_STORAGE_KEY ) ).toBe( 'true' );
	} );
} );
