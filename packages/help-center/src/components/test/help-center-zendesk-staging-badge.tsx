/**
 * @jest-environment jsdom
 */

import { isTestModeEnvironment } from '@automattic/zendesk-client';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { ZendeskStagingBadge } from '../help-center-zendesk-staging-badge';

vi.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: vi.fn(),
} ) );

const mockIsTestModeEnvironment = isTestModeEnvironment as Mock;

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
