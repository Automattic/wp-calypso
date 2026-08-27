/**
 * @jest-environment jsdom
 */

import { isTestModeEnvironment } from '@automattic/zendesk-client';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ZendeskStagingBadge } from '../help-center-zendesk-staging-badge';

jest.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: jest.fn(),
} ) );

const mockIsTestModeEnvironment = isTestModeEnvironment as jest.Mock;

describe( 'ZendeskStagingBadge', () => {
	afterEach( () => {
		mockIsTestModeEnvironment.mockReset();
	} );

	it( 'renders the badge when running against Zendesk staging', () => {
		mockIsTestModeEnvironment.mockReturnValue( true );

		render( <ZendeskStagingBadge /> );

		expect( screen.getByText( 'Staging' ) ).toBeVisible();
	} );

	it( 'renders nothing when not running against Zendesk staging', () => {
		mockIsTestModeEnvironment.mockReturnValue( false );

		const { container } = render( <ZendeskStagingBadge /> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
