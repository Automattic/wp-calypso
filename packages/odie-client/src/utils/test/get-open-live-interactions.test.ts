/**
 * @jest-environment jsdom
 */
import Smooch from 'smooch';
import {
	getOpenLiveInteractions,
	MAX_OPEN_CONVERSATIONS,
	type InteractionStatusByUuid,
} from '../get-open-live-interactions';
import type { ZendeskConversation } from '@automattic/zendesk-client';

jest.mock( 'smooch', () => ( {
	getConversations: jest.fn(),
} ) );

const mockGetConversations = ( Smooch as unknown as { getConversations: jest.Mock } )
	.getConversations;

const now = () => Math.floor( Date.now() / 1000 );

function makeConversation(
	supportInteractionId: string,
	overrides: Partial< ZendeskConversation > = {}
): ZendeskConversation {
	return {
		id: 'conv-' + supportInteractionId,
		lastUpdatedAt: now(),
		businessLastRead: 0,
		description: '',
		displayName: '',
		iconUrl: '',
		type: 'sdkGroup',
		participants: [],
		messages: [ { type: 'text', metadata: {} } as never ],
		metadata: { supportInteractionId },
		...overrides,
	};
}

describe( 'getOpenLiveInteractions', () => {
	beforeEach( () => {
		mockGetConversations.mockReset();
	} );

	it( 'counts all conversations as open when no status map is provided (legacy behaviour)', () => {
		mockGetConversations.mockReturnValue( [
			makeConversation( 'a' ),
			makeConversation( 'b' ),
			makeConversation( 'c' ),
		] );

		expect( getOpenLiveInteractions() ).toEqual( {
			mostRecentSupportInteractionId: 'a',
			openCount: 3,
			hasReachedLimit: true,
		} );
	} );

	it( 'excludes conversations whose interaction is closed', () => {
		mockGetConversations.mockReturnValue( [
			makeConversation( 'a' ),
			makeConversation( 'b' ),
			makeConversation( 'c' ),
		] );

		const statusMap: InteractionStatusByUuid = new Map( [
			[ 'a', 'open' ],
			[ 'b', 'closed' ],
			[ 'c', 'open' ],
		] );

		expect( getOpenLiveInteractions( statusMap ) ).toEqual( {
			mostRecentSupportInteractionId: 'a',
			openCount: 2,
			hasReachedLimit: false,
		} );
	} );

	it( 'excludes conversations whose interaction is solved', () => {
		mockGetConversations.mockReturnValue( [
			makeConversation( 'a' ),
			makeConversation( 'b' ),
			makeConversation( 'c' ),
		] );

		const statusMap: InteractionStatusByUuid = new Map( [
			[ 'a', 'solved' ],
			[ 'b', 'open' ],
			[ 'c', 'solved' ],
		] );

		expect( getOpenLiveInteractions( statusMap ) ).toEqual( {
			mostRecentSupportInteractionId: 'b',
			openCount: 1,
			hasReachedLimit: false,
		} );
	} );

	it( 'falls back to the heuristic for conversations missing from the map', () => {
		mockGetConversations.mockReturnValue( [
			makeConversation( 'a' ),
			makeConversation( 'b' ),
			makeConversation( 'c' ),
		] );

		// Empty map → all conversations fall back to the heuristic, all open.
		const emptyMap: InteractionStatusByUuid = new Map();
		expect( getOpenLiveInteractions( emptyMap ) ).toEqual( {
			mostRecentSupportInteractionId: 'a',
			openCount: 3,
			hasReachedLimit: true,
		} );
	} );

	it( 'still excludes conversations older than the 3-day threshold', () => {
		const old = now() - 60 * 60 * 24 * 4; // 4 days ago
		mockGetConversations.mockReturnValue( [
			makeConversation( 'a', { lastUpdatedAt: old } ),
			makeConversation( 'b' ),
		] );

		const statusMap: InteractionStatusByUuid = new Map( [
			[ 'a', 'open' ],
			[ 'b', 'open' ],
		] );

		expect( getOpenLiveInteractions( statusMap ) ).toEqual( {
			mostRecentSupportInteractionId: 'b',
			openCount: 1,
			hasReachedLimit: false,
		} );
	} );

	it( 'still excludes conversations with a csat message', () => {
		mockGetConversations.mockReturnValue( [
			makeConversation( 'a', {
				messages: [ { type: 'text', metadata: { type: 'csat' } } as never ],
			} ),
			makeConversation( 'b' ),
		] );

		const statusMap: InteractionStatusByUuid = new Map( [
			[ 'a', 'open' ],
			[ 'b', 'open' ],
		] );

		expect( getOpenLiveInteractions( statusMap ).openCount ).toBe( 1 );
	} );

	it( 'counts a recent conversation with no messages as open', () => {
		mockGetConversations.mockReturnValue( [ makeConversation( 'a', { messages: [] } ) ] );

		expect( getOpenLiveInteractions().openCount ).toBe( 1 );
	} );

	it( 'excludes a stale conversation with no messages', () => {
		const old = now() - 60 * 60 * 24 * 4; // 4 days ago
		mockGetConversations.mockReturnValue( [
			makeConversation( 'a', { messages: [], lastUpdatedAt: old } ),
		] );

		expect( getOpenLiveInteractions() ).toEqual( {
			mostRecentSupportInteractionId: null,
			openCount: 0,
			hasReachedLimit: false,
		} );
	} );

	it( 'returns null mostRecentSupportInteractionId when nothing is open', () => {
		mockGetConversations.mockReturnValue( [ makeConversation( 'a' ) ] );

		const statusMap: InteractionStatusByUuid = new Map( [ [ 'a', 'closed' ] ] );

		expect( getOpenLiveInteractions( statusMap ).mostRecentSupportInteractionId ).toBeNull();
	} );

	it( 'exports MAX_OPEN_CONVERSATIONS = 3', () => {
		expect( MAX_OPEN_CONVERSATIONS ).toBe( 3 );
	} );
} );
