import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Sources } from '../sources';
import type { Message } from '../../../types';
import type { ReactNode } from 'react';

const mockNavigate = vi.fn();
const mockTrackEvent = vi.fn();

const SUPPORT_ARTICLE_URL = 'https://wordpress.com/support/domains/';
const WOO_DOC_URL = 'https://woocommerce.com/document/managing-orders/';

vi.mock( '@automattic/components', () => ( {
	FoldableCard: ( { children }: { children: ReactNode } ) => <div>{ children }</div>,
} ) );

vi.mock( 'react-router-dom', () => ( {
	useNavigate: () => mockNavigate,
} ) );

vi.mock( '../../../context', () => ( {
	useOdieAssistantContext: () => ( { trackEvent: mockTrackEvent } ),
} ) );

const renderSources = ( url: string ) => {
	const message: Message = {
		content: 'You can manage orders from the Orders screen.',
		role: 'bot',
		type: 'message',
		message_id: 1,
		context: {
			site_id: null,
			sources: [
				{ title: 'Managing Orders', url, heading: '', blog_id: 1, post_id: 95, content: '' },
			],
		},
	};

	return render( <Sources message={ message } isMessageShowingDisclaimer={ false } /> );
};

describe( 'Sources', () => {
	beforeEach( () => {
		mockNavigate.mockClear();
		mockTrackEvent.mockClear();
	} );

	it( 'opens a WordPress.com source in the Help Center article view', async () => {
		renderSources( SUPPORT_ARTICLE_URL );

		const link = screen.getByRole( 'link', { name: 'Managing Orders' } );
		await userEvent.click( link );

		expect( link ).not.toHaveAttribute( 'target' );
		expect( mockNavigate ).toHaveBeenCalledWith( `/post?link=${ SUPPORT_ARTICLE_URL }` );
	} );

	/** The article view can't load WooCommerce.com docs, so it showed an empty Support guide. */
	it( 'opens a WooCommerce.com source in a new tab', async () => {
		renderSources( WOO_DOC_URL );

		const link = screen.getByRole( 'link', { name: 'Managing Orders (opens in a new tab)' } );
		await userEvent.click( link );

		expect( link ).toHaveAttribute( 'href', WOO_DOC_URL );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
		expect( mockNavigate ).not.toHaveBeenCalled();
	} );

	it( 'records the click on a source that opens in a new tab', async () => {
		renderSources( WOO_DOC_URL );

		await userEvent.click( screen.getByRole( 'link', { name: /Managing Orders/ } ) );

		expect( mockTrackEvent ).toHaveBeenCalledWith( 'chat_message_action_click', {
			action: 'link',
			in_chat_view: true,
			href: WOO_DOC_URL,
		} );
	} );
} );
