/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useOdieAssistantContext } from '../../../context';
import { Sources } from '../sources';
import type { Message } from '../../../types';
import type { ReactNode } from 'react';

const mockNavigate = jest.fn();
const mockTrackEvent = jest.fn();

const SOURCE_URL = 'https://woocommerce.com/document/managing-orders/';

jest.mock( '@automattic/components', () => ( {
	FoldableCard: ( { children }: { children: ReactNode } ) => <div>{ children }</div>,
} ) );

jest.mock( 'react-router-dom', () => ( {
	useNavigate: () => mockNavigate,
} ) );

jest.mock( '../../../context', () => ( {
	useOdieAssistantContext: jest.fn(),
} ) );

const message: Message = {
	content: 'You can manage orders from the Orders screen.',
	role: 'bot',
	type: 'message',
	message_id: 1,
	context: {
		site_id: null,
		sources: [
			{
				title: 'Managing Orders',
				url: SOURCE_URL,
				heading: '',
				blog_id: 1,
				post_id: 95,
				content: '',
			},
		],
	},
};

const renderSources = ( { openSourcesInNewTab }: { openSourcesInNewTab: boolean } ) => {
	( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
		trackEvent: mockTrackEvent,
		openSourcesInNewTab,
	} );

	return render( <Sources message={ message } isMessageShowingDisclaimer={ false } /> );
};

describe( 'Sources', () => {
	beforeEach( () => {
		mockNavigate.mockClear();
		mockTrackEvent.mockClear();
	} );

	it( 'opens a source in the Help Center article view', async () => {
		renderSources( { openSourcesInNewTab: false } );

		const link = screen.getByRole( 'link', { name: 'Managing Orders' } );
		await userEvent.click( link );

		expect( link ).not.toHaveAttribute( 'target' );
		expect( mockNavigate ).toHaveBeenCalledWith( `/post?link=${ SOURCE_URL }` );
	} );

	it( 'opens a source in a new tab when the Help Center asks for it', async () => {
		renderSources( { openSourcesInNewTab: true } );

		const link = screen.getByRole( 'link', { name: 'Managing Orders (opens in a new tab)' } );
		await userEvent.click( link );

		expect( link ).toHaveAttribute( 'href', SOURCE_URL );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
		expect( mockNavigate ).not.toHaveBeenCalled();
	} );

	it( 'records the click on a source that opens in a new tab', async () => {
		renderSources( { openSourcesInNewTab: true } );

		await userEvent.click( screen.getByRole( 'link', { name: /Managing Orders/ } ) );

		expect( mockTrackEvent ).toHaveBeenCalledWith( 'chat_message_action_click', {
			action: 'link',
			in_chat_view: true,
			href: SOURCE_URL,
		} );
	} );
} );
