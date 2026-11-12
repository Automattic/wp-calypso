/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import {
	getOdieEmailFallbackMessage,
	getOdieZendeskConnectionErrorMessage,
} from '../../../constants';
import { useOdieAssistantContext } from '../../../context';
import { UserMessage } from '../user-message';
import type { Message } from '../../../types';

let mockHasReachedLimit = false;

vi.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: () => false,
} ) );

vi.mock( '@automattic/data-stores', () => ( {
	HelpCenter: { PLANS_PRESALES_LAUNCHER_CONTEXT: 'plans-presales' },
} ) );

vi.mock( '@automattic/i18n-utils', () => ( {
	localizeUrl: ( url: string ) => url,
	translationExists: () => true,
} ) );

vi.mock( '@wordpress/icons', () => ( {
	Icon: () => null,
	chevronRight: 'chevron-right',
} ) );

vi.mock( 'react-router-dom', () => ( {
	useLocation: () => ( { search: '', pathname: '/' } ),
	useNavigate: () => vi.fn(),
} ) );

vi.mock( '../../../context', () => ( {
	useOdieAssistantContext: vi.fn(),
} ) );

vi.mock( '../../../data', () => ( {
	useGetSupportInteractionById: () => ( { data: null } ),
} ) );

vi.mock( '../../../data/use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( { data: undefined } ),
} ) );

vi.mock( '../../../hooks', () => ( {
	useCreateZendeskConversation: () => vi.fn(),
	useRequestHumanSupport: () => vi.fn(),
} ) );

vi.mock( '../../../hooks/use-open-interaction-status-map', () => ( {
	useOpenLiveInteractions: () => ( {
		mostRecentSupportInteractionId: null,
		hasReachedLimit: mockHasReachedLimit,
	} ),
} ) );

vi.mock( '../mardown-or-children', () => ( {
	MarkdownOrChildren: ( { messageContent }: { messageContent: string } ) => (
		<p>{ messageContent }</p>
	),
} ) );
vi.mock( '../bot-message-actions', () => ( { __esModule: true, default: () => null } ) );
vi.mock( '../sources', () => ( { __esModule: true, default: () => null } ) );

const LIMIT_TEXT = 'We noticed you have other open conversations. Would you like to see them?';

const renderMessage = (
	message: Message,
	{ isUserEligibleForPaidSupport = true, forceEmailSupport = false, isChatLoaded = true } = {}
) => {
	const shownMessage = { ...message, message_id: 1 };
	( useOdieAssistantContext as Mock ).mockReturnValue( {
		chat: { provider: 'odie', status: 'loaded', messages: [ shownMessage ] },
		isUserEligibleForPaidSupport,
		canConnectToZendesk: true,
		forceEmailSupport,
		isChatRestricted: false,
		isChatLoaded,
		trackEvent: vi.fn(),
	} );

	render( <UserMessage message={ shownMessage } isMessageWithEscalationOption /> );
};

describe( 'UserMessage when the user has reached the open conversation limit', () => {
	beforeEach( () => {
		mockHasReachedLimit = true;
	} );

	it( 'offers the open conversations when a chat can start', () => {
		renderMessage( getOdieEmailFallbackMessage() );

		expect( screen.getByText( LIMIT_TEXT ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'View my conversations' } ) ).toBeVisible();
	} );

	it( 'explains email-only support, next to its email button', () => {
		renderMessage( getOdieEmailFallbackMessage(), { forceEmailSupport: true } );

		expect( screen.getByText( /our human chat support is down for maintenance/ ) ).toBeVisible();
		expect( screen.queryByText( LIMIT_TEXT ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Send an email' } ) ).toBeVisible();
	} );

	it( 'explains the connection error when the chat client has not loaded, next to its email button', () => {
		renderMessage( getOdieZendeskConnectionErrorMessage(), { isChatLoaded: false } );

		expect( screen.getByText( /couldn't connect you to our support team/ ) ).toBeVisible();
		expect( screen.queryByText( LIMIT_TEXT ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Send an email' } ) ).toBeVisible();
	} );

	it( 'points users without paid support to the forums, next to the forums button', () => {
		renderMessage( getOdieEmailFallbackMessage(), { isUserEligibleForPaidSupport: false } );

		expect( screen.queryByText( LIMIT_TEXT ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Ask in our forums' } ) ).toBeVisible();
	} );
} );
