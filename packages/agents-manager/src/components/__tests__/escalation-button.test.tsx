/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { fireEvent, render, screen } from '@testing-library/react';
import type { MouseEventHandler, ReactNode } from 'react';

const mockGetActiveSessionId = jest.fn();
const mockNavigate = jest.fn();

jest.mock(
	'@automattic/components',
	() => ( {
		SummaryButton: ( {
			title,
			description,
			onClick,
			disabled,
		}: {
			title: ReactNode;
			description?: ReactNode;
			onClick?: MouseEventHandler;
			disabled?: boolean;
		} ) => (
			<button type="button" onClick={ onClick } disabled={ disabled }>
				<span>{ title }</span>
				{ description && <span>{ description }</span> }
			</button>
		),
		TimeSince: ( { date }: { date: string } ) => <time dateTime={ date }>2h ago</time>,
	} ),
	{ virtual: true }
);

jest.mock( '@wordpress/i18n', () => ( { __: ( text: string ) => text } ) );

jest.mock( 'react-router-dom', () => ( {
	useNavigate: () => mockNavigate,
} ) );

jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: () => ( {
		getActiveSessionId: mockGetActiveSessionId,
	} ),
} ) );

import { EscalationButton } from '../escalation-button';

describe( 'EscalationButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetActiveSessionId.mockReturnValue( 'ai-chat-123' );
	} );

	it( 'continues an existing Zendesk conversation when a Zendesk ticket id is provided', () => {
		render(
			<EscalationButton
				messageId="message-1"
				zendeskTicketId={ 11368863 }
				escalatedAt="2026-06-23T11:39:22Z"
			/>
		);

		expect( screen.getByText( 'Continue existing chat' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button' ) ).toHaveTextContent( 'Continue chat started 2h ago' );

		fireEvent.click( screen.getByRole( 'button' ) );

		expect( mockNavigate ).toHaveBeenCalledWith( '/zendesk', {
			state: { zendeskTicketId: 11368863 },
		} );
	} );

	it( 'starts a new Zendesk conversation when no active AI chat match exists', () => {
		render( <EscalationButton messageId="message-1" /> );

		expect( screen.getByText( 'Switch to Happiness Engineer' ) ).toBeInTheDocument();
		expect( screen.getByText( 'A new chat will start' ) ).toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'button' ) );

		expect( mockNavigate ).toHaveBeenCalledWith( '/zendesk', {
			state: { startedFromChatId: 'ai-chat-123', startedFromMessageId: 'message-1' },
		} );
	} );
} );
