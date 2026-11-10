/**
 * @jest-environment jsdom
 */
jest.mock( '@wordpress/a11y', () => ( { speak: jest.fn() } ) );

let mockIsNarrow = false;

jest.mock( '@automattic/viewport-react', () => ( {
	useBreakpoint: jest.fn( () => mockIsNarrow ),
} ) );

import { screen } from '@testing-library/react';
import { speak } from '@wordpress/a11y';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ConversationsInboxPlaceholder } from '../placeholder';

describe( 'ConversationsInboxPlaceholder', () => {
	beforeEach( () => {
		mockIsNarrow = false;
		jest.mocked( speak ).mockClear();
	} );

	const renderPlaceholder = ( hasConversation: boolean ) => {
		const { container } = renderWithProvider(
			<ConversationsInboxPlaceholder hasConversation={ hasConversation } />
		);
		return container.querySelector( '.conversations-inbox__detail-pane' );
	};

	it( 'shows the list and the conversation placeholders side by side', () => {
		const detail = renderPlaceholder( false );

		expect( screen.getByRole( 'heading', { name: 'Conversations' } ) ).toBeVisible();
		expect( detail ).toBeInTheDocument();
		expect( speak ).toHaveBeenCalledTimes( 1 );
		expect( speak ).toHaveBeenCalledWith( 'Loading conversations…' );
	} );

	it( 'leaves out the conversation on a narrow screen with none open', () => {
		mockIsNarrow = true;

		expect( renderPlaceholder( false ) ).not.toBeInTheDocument();
	} );

	it( 'shows the conversation on a narrow screen when one is open', () => {
		mockIsNarrow = true;

		expect( renderPlaceholder( true ) ).toBeInTheDocument();
	} );
} );
