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
const mockSetShowHelpCenter = jest.fn();
const mockSetShowSupportDoc = jest.fn();
const mockSetNavigateToRoute = jest.fn();
const mockSetNewMessagingChat = jest.fn();
const mockGetHelpCenterRouterHistory = jest.fn();
const mockIsResolving = jest.fn();
let mockCurrentUserId = 1;

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		consumeLoggedOutOdieChatHandoff: mockConsumeLoggedOutOdieChatHandoff,
		setShowHelpCenter: mockSetShowHelpCenter,
		setShowSupportDoc: mockSetShowSupportDoc,
		setNavigateToRoute: mockSetNavigateToRoute,
		setNewMessagingChat: mockSetNewMessagingChat,
	} ),
	useSelect: ( callback: ( select: () => unknown ) => unknown ) =>
		callback( () => ( {
			getPendingLoggedOutOdieChat: mockGetPendingLoggedOutOdieChat,
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
		expect( mockConsumeLoggedOutOdieChatHandoff ).not.toHaveBeenCalled();
	} );

	it( 'consumes the handoff when the current user becomes logged in', () => {
		mockCurrentUserId = 0;
		const { rerender } = renderHook( () => useActionHooks() );

		expect( mockConsumeLoggedOutOdieChatHandoff ).not.toHaveBeenCalled();

		mockCurrentUserId = 1;
		rerender();

		expect( mockSetNavigateToRoute ).toHaveBeenCalledWith( '/' );
		expect( mockSetShowHelpCenter ).toHaveBeenCalledWith( true );
		expect( mockConsumeLoggedOutOdieChatHandoff ).toHaveBeenCalledWith( mockLoggedOutBotSlug );
	} );

	it( 'does nothing when there is no pending handoff', () => {
		mockGetPendingLoggedOutOdieChat.mockReturnValue( undefined );

		renderHook( () => useActionHooks() );

		act( () => {
			jest.runOnlyPendingTimers();
		} );

		expect( mockSetNavigateToRoute ).not.toHaveBeenCalled();
		expect( mockSetShowHelpCenter ).not.toHaveBeenCalled();
		expect( mockConsumeLoggedOutOdieChatHandoff ).not.toHaveBeenCalled();
	} );

	it( 'waits for persisted Help Center state before consuming the handoff', () => {
		mockIsResolving.mockReturnValue( true );
		const { rerender } = renderHook( () => useActionHooks() );

		expect( mockSetNavigateToRoute ).not.toHaveBeenCalled();
		expect( mockConsumeLoggedOutOdieChatHandoff ).not.toHaveBeenCalled();

		mockIsResolving.mockReturnValue( false );
		rerender();

		expect( mockSetNavigateToRoute ).toHaveBeenCalledWith( '/' );
		expect( mockSetShowHelpCenter ).toHaveBeenCalledWith( true );
		expect( mockConsumeLoggedOutOdieChatHandoff ).toHaveBeenCalledWith( mockLoggedOutBotSlug );
	} );

	it( 'reacts when a pending handoff becomes available after the first render', () => {
		mockGetPendingLoggedOutOdieChat.mockReturnValueOnce( undefined );
		const { rerender } = renderHook( () => useActionHooks() );

		expect( mockConsumeLoggedOutOdieChatHandoff ).not.toHaveBeenCalled();

		mockGetPendingLoggedOutOdieChat.mockReturnValue( mockLoggedOutSession );
		rerender();

		expect( mockSetNavigateToRoute ).toHaveBeenCalledWith( '/' );
		expect( mockSetShowHelpCenter ).toHaveBeenCalledWith( true );
		expect( mockConsumeLoggedOutOdieChatHandoff ).toHaveBeenCalledWith( mockLoggedOutBotSlug );
	} );
} );
