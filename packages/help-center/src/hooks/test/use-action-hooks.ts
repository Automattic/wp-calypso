/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';

const mockLoggedOutBotSlug = 'wpcom-workflow-chat_loggedout';
const mockLoggedOutSession = {
	odieId: 123,
	sessionId: 'session-id',
	botSlug: mockLoggedOutBotSlug,
};
const mockGetPendingLoggedOutOdieChat = jest.fn();
const mockConsumeLoggedOutOdieChatHandoff = jest.fn();
const mockSetLoggedOutOdieChat = jest.fn();
const mockSetShowHelpCenter = jest.fn();
const mockSetShowSupportDoc = jest.fn();
const mockSetNavigateToRoute = jest.fn();
const mockSetNewMessagingChat = jest.fn();
const mockGetHelpCenterRouterHistory = jest.fn();
const mockIsResolving = jest.fn();
let mockCurrentUserId = 1;

jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: {
		consumeLoggedOutOdieChatHandoff: mockConsumeLoggedOutOdieChatHandoff,
		getPendingLoggedOutOdieChat: mockGetPendingLoggedOutOdieChat,
		register: () => 'help-center',
	},
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		setLoggedOutOdieChat: mockSetLoggedOutOdieChat,
		setShowHelpCenter: mockSetShowHelpCenter,
		setShowSupportDoc: mockSetShowSupportDoc,
		setNavigateToRoute: mockSetNavigateToRoute,
		setNewMessagingChat: mockSetNewMessagingChat,
	} ),
	useSelect: ( callback: ( select: () => unknown ) => unknown ) =>
		callback( () => ( {
			getHelpCenterRouterHistory: mockGetHelpCenterRouterHistory,
			isResolving: mockIsResolving,
		} ) ),
} ) );

jest.mock( '../../contexts/HelpCenterContext', () => ( {
	useHelpCenterContext: () => ( {
		currentUser: { ID: mockCurrentUserId },
		newLoggedOutInteractionsBotSlug: mockLoggedOutBotSlug,
	} ),
} ) );

const { useActionHooks } = jest.requireActual(
	'../use-action-hooks'
) as typeof import('../use-action-hooks');

describe( 'useActionHooks', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		mockCurrentUserId = 1;
		mockIsResolving.mockReturnValue( false );
		mockGetPendingLoggedOutOdieChat.mockReturnValue( mockLoggedOutSession );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'opens a pending logged-out session at Help Center home after login', () => {
		renderHook( () => useActionHooks() );

		act( () => {
			jest.runOnlyPendingTimers();
		} );

		expect( mockSetLoggedOutOdieChat ).toHaveBeenCalledWith( mockLoggedOutSession );
		expect( mockSetNavigateToRoute ).toHaveBeenCalledWith( '/' );
		expect( mockSetShowHelpCenter ).toHaveBeenCalledWith( true );
		expect( mockConsumeLoggedOutOdieChatHandoff ).toHaveBeenCalledWith( mockLoggedOutBotSlug );
	} );

	it( 'leaves a logged-out handoff pending until the user logs in', () => {
		mockCurrentUserId = 0;

		renderHook( () => useActionHooks() );

		act( () => {
			jest.runOnlyPendingTimers();
		} );

		expect( mockGetPendingLoggedOutOdieChat ).not.toHaveBeenCalled();
		expect( mockSetLoggedOutOdieChat ).not.toHaveBeenCalled();
		expect( mockConsumeLoggedOutOdieChatHandoff ).not.toHaveBeenCalled();
	} );
} );
