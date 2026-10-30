/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { act, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { OdieAssistantProvider, useOdieAssistantContext } from '../index';
import type { CheckoutSupportVariation } from '@automattic/data-stores';

let mockCheckoutSupportVariation: CheckoutSupportVariation | undefined;
let mockOdieBotNameSlug: string | undefined;

jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: { register: () => 'automattic/help-center' },
} ) );

jest.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: () => false,
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
	withSiteContext: ( properties: Record< string, unknown > ) => properties,
} ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( selector: ( select: unknown ) => unknown ) =>
		selector( () => ( {
			getOdieBotNameSlug: () => mockOdieBotNameSlug,
			getIsMinimized: () => false,
			getIsChatLoaded: () => true,
			getCheckoutSupportVariation: () => mockCheckoutSupportVariation,
		} ) ),
} ) );

jest.mock( 'react-router-dom', () => ( {
	useNavigate: () => jest.fn(),
} ) );

// Arguments: whether Zendesk chats can be loaded, and whether that is still being checked.
const mockUseGetCombinedChat = jest.fn< object, [ boolean, boolean ] >( () => ( {
	mainChatState: { messages: [] },
	setMainChatState: jest.fn(),
	isLoadingZendeskHistory: false,
} ) );

jest.mock( '../../hooks', () => ( {
	useGetCombinedChat: ( canConnectToZendesk: boolean, isLoadingCanConnectToZendesk: boolean ) =>
		mockUseGetCombinedChat( canConnectToZendesk, isLoadingCanConnectToZendesk ),
} ) );

const VariationReader = () => {
	const { checkoutSupportVariation } = useOdieAssistantContext();
	return <span data-testid="variation">{ checkoutSupportVariation ?? 'none' }</span>;
};

const renderProvider = () =>
	render(
		<OdieAssistantProvider
			newInteractionsBotSlug="wpcom-workflow-support_chat"
			newLoggedOutInteractionsBotSlug="wpcom-workflow-chat_loggedout"
			currentUser={ { display_name: 'Me' } }
		>
			<VariationReader />
		</OdieAssistantProvider>
	);

describe( 'OdieAssistantProvider – checkout support variation', () => {
	afterEach( () => {
		mockCheckoutSupportVariation = undefined;
	} );

	it( 'exposes the variation from the Help Center store', () => {
		mockCheckoutSupportVariation = 'human_only';

		renderProvider();

		expect( screen.getByTestId( 'variation' ).textContent ).toBe( 'human_only' );
	} );

	it( 'exposes no variation when support was not opened from checkout', () => {
		renderProvider();

		expect( screen.getByTestId( 'variation' ).textContent ).toBe( 'none' );
	} );
} );

describe( 'OdieAssistantProvider – Odie events', () => {
	const EventSender = () => {
		const { trackEvent } = useOdieAssistantContext();
		useEffect( () => {
			trackEvent( 'test_event', { foo: 'bar' } );
		}, [ trackEvent ] );
		return null;
	};

	const renderAndSendEvent = () =>
		render(
			<OdieAssistantProvider
				newInteractionsBotSlug="wpcom-workflow-support_chat"
				newLoggedOutInteractionsBotSlug="wpcom-workflow-chat_loggedout"
				currentUser={ { display_name: 'Me' } }
			>
				<EventSender />
			</OdieAssistantProvider>
		);

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	afterEach( () => {
		mockCheckoutSupportVariation = undefined;
		mockOdieBotNameSlug = undefined;
	} );

	it( 'adds the checkout support variation to events from a checkout support chat', () => {
		mockCheckoutSupportVariation = 'hybrid';

		renderAndSendEvent();

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_odie_test_event',
			expect.objectContaining( { foo: 'bar', checkout_support_variation: 'hybrid' } )
		);
	} );

	it( 'leaves the variation out of other events', () => {
		renderAndSendEvent();

		expect( ( recordTracksEvent as jest.Mock ).mock.calls[ 0 ][ 1 ] ).not.toHaveProperty(
			'checkout_support_variation'
		);
	} );

	it( 'records the bot in use when the Help Center overrides it', () => {
		mockOdieBotNameSlug = 'wpcom-plan-support';

		renderAndSendEvent();

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_odie_test_event',
			expect.objectContaining( { bot_name_slug: 'wpcom-plan-support' } )
		);
	} );
} );

describe( 'OdieAssistantProvider – loading human chats from Zendesk', () => {
	const renderWith = ( props: {
		isUserEligibleForPaidSupport: boolean;
		hasOpenZendeskChat: boolean;
		canConnectToZendesk: boolean;
	} ) =>
		render(
			<OdieAssistantProvider
				newInteractionsBotSlug="wpcom-workflow-support_chat"
				newLoggedOutInteractionsBotSlug="wpcom-workflow-chat_loggedout"
				currentUser={ { display_name: 'Me' } }
				{ ...props }
			/>
		);

	const canLoadZendeskChats = () => mockUseGetCombinedChat.mock.calls.at( -1 )?.[ 0 ];

	beforeEach( () => {
		mockUseGetCombinedChat.mockClear();
	} );

	it( 'loads them for a user without paid support who has an open human chat', () => {
		renderWith( {
			isUserEligibleForPaidSupport: false,
			hasOpenZendeskChat: true,
			canConnectToZendesk: true,
		} );

		expect( canLoadZendeskChats() ).toBe( true );
	} );

	it( 'does not load them for a user without paid support or an open human chat', () => {
		renderWith( {
			isUserEligibleForPaidSupport: false,
			hasOpenZendeskChat: false,
			canConnectToZendesk: true,
		} );

		expect( canLoadZendeskChats() ).toBe( false );
	} );

	it( 'does not load them when Zendesk cannot be reached', () => {
		renderWith( {
			isUserEligibleForPaidSupport: false,
			hasOpenZendeskChat: true,
			canConnectToZendesk: false,
		} );

		expect( canLoadZendeskChats() ).toBe( false );
	} );
} );

describe( 'OdieAssistantProvider – pending request for a human', () => {
	const request = {
		createdFrom: 'automatic_escalation',
		flags: { isEmergency: false, emergencyType: null, routeToEmail: false },
	};

	let setPending: ( value: typeof request | null ) => void = () => {};

	const PendingReader = () => {
		const { pendingHumanSupportRequest, setPendingHumanSupportRequest } = useOdieAssistantContext();
		setPending = setPendingHumanSupportRequest;
		return <span data-testid="pending">{ pendingHumanSupportRequest?.createdFrom ?? 'none' }</span>;
	};

	const provider = () => (
		<OdieAssistantProvider
			newInteractionsBotSlug="wpcom-workflow-support_chat"
			newLoggedOutInteractionsBotSlug="wpcom-workflow-chat_loggedout"
			currentUser={ { display_name: 'Me' } }
		>
			<PendingReader />
		</OdieAssistantProvider>
	);

	const mockChat = ( odieId: number ) =>
		mockUseGetCombinedChat.mockReturnValue( {
			mainChatState: { messages: [], odieId },
			setMainChatState: jest.fn(),
			isLoadingZendeskHistory: false,
		} );

	afterEach( () => {
		mockUseGetCombinedChat.mockReset();
		mockUseGetCombinedChat.mockReturnValue( {
			mainChatState: { messages: [] },
			setMainChatState: jest.fn(),
			isLoadingZendeskHistory: false,
		} );
	} );

	it( 'keeps the request for the chat it was made in', () => {
		mockChat( 1 );
		render( provider() );

		act( () => setPending( request ) );

		expect( screen.getByTestId( 'pending' ).textContent ).toBe( 'automatic_escalation' );
	} );

	it( "doesn't carry the request into another chat", () => {
		mockChat( 1 );
		const { rerender } = render( provider() );
		act( () => setPending( request ) );

		mockChat( 2 );
		rerender( provider() );

		expect( screen.getByTestId( 'pending' ).textContent ).toBe( 'none' );
	} );
} );
