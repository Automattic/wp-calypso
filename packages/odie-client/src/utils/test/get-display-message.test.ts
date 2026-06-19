// `../../constants` only needs `isTestModeEnvironment` from the zendesk-client
// package. Mock it so importing the real constants does not pull in the full
// `@automattic/zendesk-client` index (and its `@automattic/agenttic-ui` dependency).
jest.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: () => false,
} ) );

import {
	getOdieForwardToForumsMessage,
	getOdieForwardToZendeskMessage,
	getOdieThirdPartyMessageContent,
	getOdieEmailFallbackMessageContent,
	getOdieErrorMessage,
	getOdieErrorMessageNonEligible,
} from '../../constants';
import { getDisplayMessage } from '../get-display-message';

describe( 'getDisplayMessage', () => {
	const CHAT_LOADED = true;
	const CHAT_NOT_LOADED = false;

	it( 'returns the 3rd-party-cookie message when a paid user cannot reach Zendesk', () => {
		expect(
			getDisplayMessage(
				false, // userHasRecentOpenConversation
				true, // isUserEligibleForPaidSupport
				false, // canConnectToZendesk
				false, // forceEmailSupport
				false, // isChatRestricted
				false, // isErrorMessage
				CHAT_LOADED
			)
		).toBe( getOdieThirdPartyMessageContent() );
	} );

	it( 'returns the 3rd-party-cookie message when a paid user can reach Zendesk but chat never loaded (cookie-blocked Smooch init failure)', () => {
		expect(
			getDisplayMessage(
				false, // userHasRecentOpenConversation
				true, // isUserEligibleForPaidSupport
				true, // canConnectToZendesk (config ping succeeds even with cookies blocked)
				false, // forceEmailSupport
				false, // isChatRestricted
				false, // isErrorMessage
				CHAT_NOT_LOADED
			)
		).toBe( getOdieThirdPartyMessageContent() );
	} );

	it( 'returns the email fallback when email support is forced for a paid user', () => {
		expect( getDisplayMessage( false, true, true, true, false, false, CHAT_LOADED ) ).toBe(
			getOdieEmailFallbackMessageContent( false )
		);
	} );

	it( 'returns the non-eligible error message for a non-paid user on an error message', () => {
		expect( getDisplayMessage( false, false, true, false, false, true, CHAT_LOADED ) ).toBe(
			getOdieErrorMessageNonEligible()
		);
	} );

	it( 'returns the generic offline error for a paid user on an error message', () => {
		expect( getDisplayMessage( false, true, true, false, false, true, CHAT_LOADED ) ).toBe(
			getOdieErrorMessage()
		);
	} );

	it( 'forwards a paid user to Zendesk when chat is loaded and there is no error', () => {
		expect( getDisplayMessage( false, true, true, false, false, false, CHAT_LOADED ) ).toBe(
			getOdieForwardToZendeskMessage( false )
		);
	} );

	it( 'forwards a non-paid user to the forums when there is no error', () => {
		expect( getDisplayMessage( false, false, true, false, false, false, CHAT_LOADED ) ).toBe(
			getOdieForwardToForumsMessage()
		);
	} );

	it( 'does not show the cookie message to a non-paid user whose chat never loaded', () => {
		expect( getDisplayMessage( false, false, true, false, false, false, CHAT_NOT_LOADED ) ).toBe(
			getOdieForwardToForumsMessage()
		);
	} );
} );
