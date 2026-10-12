/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { OdieAssistantProvider, useOdieAssistantContext } from '../index';
import type { CheckoutSupportVariation } from '@automattic/data-stores';

let mockCheckoutSupportVariation: CheckoutSupportVariation | undefined;

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
			getOdieBotNameSlug: () => undefined,
			getIsMinimized: () => false,
			getIsChatLoaded: () => true,
			getCheckoutSupportVariation: () => mockCheckoutSupportVariation,
		} ) ),
} ) );

jest.mock( 'react-router-dom', () => ( {
	useNavigate: () => jest.fn(),
} ) );

jest.mock( '../../hooks', () => ( {
	useGetCombinedChat: () => ( {
		mainChatState: { messages: [] },
		setMainChatState: jest.fn(),
		isLoadingZendeskHistory: false,
	} ),
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
