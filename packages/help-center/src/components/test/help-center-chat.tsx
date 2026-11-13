/**
 * @jest-environment jsdom
 */
import { act, render } from '@testing-library/react';
import { defaultI18n, resetLocaleData, setLocaleData } from '@wordpress/i18n';
import { I18nProvider } from '@wordpress/react-i18n';
import { HelpCenterChat } from '../help-center-chat';

const mockNavigate = jest.fn();
const mockProviderProps = jest.fn();

// Changed by each test.
let mockShouldUseWapuu = false;
let mockOpenZendeskChat = { hasOpenZendeskChat: false, isLoading: false };

jest.mock( '@automattic/odie-client', () => ( {
	__esModule: true,
	default: ( { children, ...props }: { children: React.ReactNode } ) => {
		mockProviderProps( props );
		return children;
	},
	OdieAssistant: () => null,
} ) );

jest.mock( '@automattic/zendesk-client', () => ( {
	useCanConnectToZendeskMessaging: () => ( { data: true, isLoading: false } ),
} ) );

jest.mock( 'react-router-dom', () => ( {
	useLocation: () => ( { search: '' } ),
	useNavigate: () => mockNavigate,
} ) );

jest.mock( '../../contexts/HelpCenterContext', () => ( {
	useFeatureConfig: () => ( {
		chat: {},
		aiDisclosureLine: ( __: ( text: string, domain?: string ) => string ) =>
			__( 'You’re chatting with AI from Woo Support.', 'default' ),
	} ),
	useHelpCenterContext: () => ( { currentUser: { ID: 1 } } ),
} ) );

jest.mock( '../../data/use-support-status', () => ( {
	useSupportStatus: () => ( { data: undefined } ),
} ) );

// Mock the hooks index, so its whole dependency graph doesn't load in jsdom.
jest.mock( '../../hooks', () => ( {
	useChatStatus: () => ( { forceEmailSupport: false, isChatRestricted: false } ),
	useShouldUseWapuu: () => mockShouldUseWapuu,
} ) );

jest.mock( '../../hooks/use-has-open-zendesk-chat', () => ( {
	useHasOpenZendeskChat: () => mockOpenZendeskChat,
} ) );

jest.mock( '../../hooks/use-help-center-tracks-event', () => ( {
	useHelpCenterTracksEvent: () => jest.fn(),
} ) );

const renderChat = ( isUserEligibleForPaidSupport = false ) =>
	render(
		<HelpCenterChat
			isLoadingStatus={ false }
			isUserEligibleForPaidSupport={ isUserEligibleForPaidSupport }
		/>
	);

const lastProviderProps = () => mockProviderProps.mock.calls.at( -1 )?.[ 0 ];

beforeEach( () => {
	jest.clearAllMocks();
	mockShouldUseWapuu = false;
	mockOpenZendeskChat = { hasOpenZendeskChat: false, isLoading: false };
} );

describe( 'HelpCenterChat access without Wapuu', () => {
	it( 'sends users without paid support or an open human chat back home', () => {
		renderChat();

		expect( mockNavigate ).toHaveBeenCalledWith( '/' );
	} );

	it( 'keeps users with an open human chat on it', () => {
		mockOpenZendeskChat = { hasOpenZendeskChat: true, isLoading: false };

		renderChat();

		expect( mockNavigate ).not.toHaveBeenCalled();
	} );

	it( 'waits for the open human chat check before sending anyone home', () => {
		mockOpenZendeskChat = { hasOpenZendeskChat: false, isLoading: true };

		renderChat();

		expect( mockNavigate ).not.toHaveBeenCalled();
	} );
} );

describe( 'HelpCenterChat Zendesk loading', () => {
	beforeEach( () => {
		mockShouldUseWapuu = true;
	} );

	it( 'keeps the chat loading while the open human chat check runs, without paid support', () => {
		mockOpenZendeskChat = { hasOpenZendeskChat: false, isLoading: true };

		renderChat();

		expect( lastProviderProps() ).toMatchObject( { isLoadingCanConnectToZendesk: true } );
	} );

	it( "doesn't wait for the open human chat check with paid support", () => {
		mockOpenZendeskChat = { hasOpenZendeskChat: false, isLoading: true };

		renderChat( true );

		expect( lastProviderProps() ).toMatchObject( { isLoadingCanConnectToZendesk: false } );
	} );

	it( 'passes the open human chat on to the Odie client', () => {
		mockOpenZendeskChat = { hasOpenZendeskChat: true, isLoading: false };

		renderChat();

		expect( lastProviderProps() ).toMatchObject( {
			hasOpenZendeskChat: true,
			isLoadingCanConnectToZendesk: false,
		} );
	} );
} );

describe( 'HelpCenterChat AI disclosure line', () => {
	it( 'passes the product’s line on to the Odie client', () => {
		renderChat();

		expect( lastProviderProps().aiDisclosureLine ).toBe(
			'You’re chatting with AI from Woo Support.'
		);
	} );

	it( 'updates the product’s line when its translation loads after the first render', () => {
		render(
			<I18nProvider i18n={ defaultI18n }>
				<HelpCenterChat isLoadingStatus={ false } isUserEligibleForPaidSupport={ false } />
			</I18nProvider>
		);

		act( () => {
			setLocaleData(
				{
					'You’re chatting with AI from Woo Support.': [
						'Estás chateando con la IA del soporte de Woo.',
					],
				},
				'default'
			);
		} );

		expect( lastProviderProps().aiDisclosureLine ).toBe(
			'Estás chateando con la IA del soporte de Woo.'
		);
		resetLocaleData( undefined, 'default' );
	} );
} );
