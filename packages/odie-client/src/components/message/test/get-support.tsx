/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useOdieAssistantContext } from '../../../context';
import { GetSupport } from '../get-support';

const mockCreateZendeskConversation = jest.fn();
const mockNavigate = jest.fn();

let mockHasReachedLimit = false;
let mockSupportInteraction: { uuid: string } | null = { uuid: 'int-1' };

jest.mock( '@automattic/i18n-utils', () => ( {
	localizeUrl: ( url: string ) => url,
	translationExists: () => true,
} ) );

jest.mock( '@wordpress/components', () => ( {
	Icon: () => null,
} ) );

jest.mock( '@wordpress/icons', () => ( {
	Icon: () => null,
	chevronRight: 'chevron-right',
} ) );

jest.mock( 'react-router-dom', () => ( {
	useLocation: () => ( { search: '', pathname: '/' } ),
	useNavigate: () => mockNavigate,
} ) );

jest.mock( '../../../context', () => ( {
	useOdieAssistantContext: jest.fn(),
} ) );

jest.mock( '../../../data', () => ( {
	useGetSupportInteractionById: () => ( { data: mockSupportInteraction } ),
} ) );

jest.mock( '../../../hooks', () => ( {
	useCreateZendeskConversation: () => mockCreateZendeskConversation,
} ) );

jest.mock( '../../../hooks/use-open-interaction-status-map', () => ( {
	useOpenLiveInteractions: () => ( {
		mostRecentSupportInteractionId: mockSupportInteraction?.uuid ?? null,
		hasReachedLimit: mockHasReachedLimit,
	} ),
} ) );

const setContext = ( {
	isChatLoaded,
	forceEmailSupport = false,
}: {
	isChatLoaded: boolean;
	forceEmailSupport?: boolean;
} ) => {
	( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
		chat: { provider: 'odie', status: 'loaded' },
		isUserEligibleForPaidSupport: true,
		canConnectToZendesk: true,
		trackEvent: jest.fn(),
		isChatLoaded,
		forceEmailSupport,
	} );
};

describe( 'GetSupport', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockHasReachedLimit = false;
		mockSupportInteraction = { uuid: 'int-1' };
	} );

	it( 'escalates when the user asks to be connected with someone new', async () => {
		setContext( { isChatLoaded: true } );

		render( <GetSupport /> );
		await userEvent.click( screen.getByText( 'No, connect me with someone new' ) );

		expect( mockCreateZendeskConversation ).toHaveBeenCalledWith( {
			createdFrom: 'chat_support_button',
		} );
	} );

	// The escalation button is only offered once the Smooch SDK has loaded: until then the
	// user is routed to email instead.
	it( 'offers email instead of chat while the chat SDK has not loaded', () => {
		setContext( { isChatLoaded: false } );

		render( <GetSupport /> );

		expect( screen.getByText( 'Send an email' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'No, connect me with someone new' ) ).not.toBeInTheDocument();
	} );

	// Every combination of the inputs that decide which buttons render, pinning the invariant
	// the escalation path relies on: the Zendesk button is never offered before the Smooch SDK
	// has loaded, so its handler can assume a loaded SDK.
	const booleans = [ true, false ];

	it.each(
		booleans.flatMap( ( isChatLoaded ) =>
			booleans.flatMap( ( forceAIConversation ) =>
				booleans.flatMap( ( forceEmailSupport ) =>
					booleans.flatMap( ( hasReachedLimit ) =>
						booleans.map( ( hasSupportInteraction ) => ( {
							isChatLoaded,
							forceAIConversation,
							forceEmailSupport,
							hasReachedLimit,
							hasSupportInteraction,
						} ) )
					)
				)
			)
		)
	)( 'only ever escalates with a loaded chat SDK (%o)', async ( scenario ) => {
		const {
			isChatLoaded,
			forceAIConversation,
			forceEmailSupport,
			hasReachedLimit,
			hasSupportInteraction,
		} = scenario;

		mockHasReachedLimit = hasReachedLimit;
		mockSupportInteraction = hasSupportInteraction ? { uuid: 'int-1' } : null;
		setContext( { isChatLoaded, forceEmailSupport } );

		render( <GetSupport forceAIConversation={ forceAIConversation } /> );

		for ( const button of screen.queryAllByRole( 'button' ) ) {
			await userEvent.click( button );
		}

		// Escalation is offered only to a paid user with Zendesk access (both fixed here) whose
		// chat SDK has loaded, who isn't being forced to email or to the AI, and who hasn't hit
		// the open-conversation limit.
		const escalationOffered =
			isChatLoaded && ! forceEmailSupport && ! forceAIConversation && ! hasReachedLimit;

		expect( mockCreateZendeskConversation ).toHaveBeenCalledTimes( escalationOffered ? 1 : 0 );
	} );
} );
