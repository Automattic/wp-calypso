/**
 * @jest-environment jsdom
 */

import { QueryClient } from '@tanstack/react-query';
import { render } from '../../../test-utils';
import OmnibarAgentsManager from '../omnibar-agents-manager';

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
} );
