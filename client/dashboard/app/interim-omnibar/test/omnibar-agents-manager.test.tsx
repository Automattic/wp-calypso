/**
 * @jest-environment jsdom
 */

import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import OmnibarAgentsManager from '../omnibar-agents-manager';

jest.mock( '@automattic/agents-manager', () => ( {
	...jest.requireActual( '@automattic/agents-manager' ),
	__esModule: true,
	default: () => <div role="region" aria-label="Agents Manager" />,
} ) );

function createQueryClient( unifiedAiChat: boolean ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	queryClient.setQueryData( [ 'unified-ai-chat' ], unifiedAiChat );
	return queryClient;
}

describe( '<OmnibarAgentsManager />', () => {
	test( 'renders nothing when the user is not eligible for the unified AI chat', () => {
		const { container } = render( <OmnibarAgentsManager />, {
			queryClient: createQueryClient( false ),
		} );

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders the agents-manager when the user is eligible for the unified AI chat', async () => {
		render( <OmnibarAgentsManager />, {
			queryClient: createQueryClient( true ),
		} );

		expect( await screen.findByRole( 'region', { name: 'Agents Manager' } ) ).toBeVisible();
	} );
} );
