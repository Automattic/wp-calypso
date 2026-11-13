/* eslint-disable import/order */
import { vi } from 'vitest';
const mockDispatch = vi.fn();
vi.mock( '@wordpress/data', () => ( { dispatch: ( store: string ) => mockDispatch( store ) } ) );
vi.mock( '../agent-session', () => ( { getActiveSessionId: vi.fn( () => 'session-1' ) } ) );
vi.mock( '../get-agents-manager-inline-data', () => ( {
	getAgentsManagerInlineData: vi.fn( () => ( { site: { ID: 42, domain: 'example.com' } } ) ),
} ) );

import { getActiveSessionId } from '../agent-session';
import { getAgentsManagerInlineData } from '../get-agents-manager-inline-data';
import { openHelpCenterChat } from '../open-help-center-chat';

const helpCenter = { setShowHelpCenter: vi.fn(), setNewMessagingChat: vi.fn() };

beforeEach( () => {
	vi.clearAllMocks();
	mockDispatch.mockReturnValue( helpCenter );
} );

describe( 'openHelpCenterChat', () => {
	it( 'opens the Help Center on a premium support chat tied to this session', () => {
		expect( openHelpCenterChat( ' Summary for support. ' ) ).toBe( true );

		expect( mockDispatch ).toHaveBeenCalledWith( 'automattic/help-center' );
		expect( helpCenter.setShowHelpCenter ).toHaveBeenCalledWith( true, {
			hasPremiumSupport: true,
			hideBackButton: false,
			contextTerm: '',
		} );
		expect( helpCenter.setNewMessagingChat ).toHaveBeenCalledWith( {
			initialMessage: 'Summary for support.',
			siteUrl: 'https://example.com',
			siteId: '42',
			userFieldFlowName: 'big-sky-human-support',
			externalChatProvider: 'agents-manager',
			externalChatId: 'session-1',
		} );
	} );

	it( 'sends a default message, and leaves out a site and session it does not have', () => {
		vi.mocked( getAgentsManagerInlineData ).mockReturnValueOnce( undefined );
		vi.mocked( getActiveSessionId ).mockReturnValueOnce( '' );

		openHelpCenterChat();

		expect( helpCenter.setNewMessagingChat ).toHaveBeenCalledWith( {
			initialMessage: 'The user asked to talk to a human.',
			userFieldFlowName: 'big-sky-human-support',
			externalChatProvider: 'agents-manager',
		} );
	} );

	// The Help Center is not on every page the chat is.
	it.each( [
		[ 'no store', undefined ],
		[ 'a store without the chat action', { setShowHelpCenter: vi.fn() } ],
	] )( 'reports it could not open with %s', ( _, store ) => {
		mockDispatch.mockReturnValue( store );

		expect( openHelpCenterChat( 'x' ) ).toBe( false );
		expect( helpCenter.setShowHelpCenter ).not.toHaveBeenCalled();
	} );
} );
