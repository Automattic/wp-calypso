/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useOdieAssistantContext } from '../../context';
import { useRequestHumanSupport } from '../use-request-human-support';
import type { HumanSupportRequest } from '../../types';

const mockCreateZendeskConversation = jest.fn();
const mockSetPendingHumanSupportRequest = jest.fn();
const mockSetChatStatus = jest.fn();
const mockTrackEvent = jest.fn();

jest.mock( '../../context', () => ( {
	useOdieAssistantContext: jest.fn(),
} ) );

jest.mock( '../use-create-zendesk-conversation', () => ( {
	useCreateZendeskConversation: () => mockCreateZendeskConversation,
} ) );

const request: HumanSupportRequest = {
	createdFrom: 'automatic_escalation',
	isFromError: false,
	escalationOnSecondAttempt: true,
	flags: { isEmergency: true, emergencyType: 'site_down', routeToEmail: false },
};

const mockContext = ( humanSupportRouting: unknown ) =>
	( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
		humanSupportRouting,
		setPendingHumanSupportRequest: mockSetPendingHumanSupportRequest,
		setChatStatus: mockSetChatStatus,
		trackEvent: mockTrackEvent,
	} );

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( 'useRequestHumanSupport', () => {
	it( 'starts the chat without a routing step', () => {
		mockContext( null );
		const { result } = renderHook( () => useRequestHumanSupport() );

		result.current( request );

		expect( mockCreateZendeskConversation ).toHaveBeenCalledWith( {
			createdFrom: 'automatic_escalation',
			isFromError: false,
			errorReason: undefined,
			escalationOnSecondAttempt: true,
		} );
		expect( mockSetPendingHumanSupportRequest ).not.toHaveBeenCalled();
		expect( mockSetChatStatus ).not.toHaveBeenCalled();
	} );

	it( 'leaves the request to the routing step when there is one', () => {
		mockContext( { Step: () => null } );
		const { result } = renderHook( () => useRequestHumanSupport() );

		result.current( request );

		expect( mockSetPendingHumanSupportRequest ).toHaveBeenCalledWith( request );
		// The bot's reply is in, so the chat isn't waiting on it any more.
		expect( mockSetChatStatus ).toHaveBeenCalledWith( 'loaded' );
		expect( mockCreateZendeskConversation ).not.toHaveBeenCalled();
		expect( mockTrackEvent ).toHaveBeenCalledWith( 'human_support_routing_started', {
			created_from: 'automatic_escalation',
			is_emergency: true,
			route_to_email: false,
		} );
	} );
} );
