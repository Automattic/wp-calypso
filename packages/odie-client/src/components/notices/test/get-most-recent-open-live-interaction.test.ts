/**
 * @jest-environment jsdom
 */
import Smooch from 'smooch';
import getMostRecentOpenLiveInteraction, {
	getOpenLiveInteractionCount,
	hasReachedConversationLimit,
	MAX_OPEN_CONVERSATIONS,
	type InteractionStatusByUuid,
} from '../get-most-recent-open-live-interaction';
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

describe( 'get-most-recent-open-live-interaction', () => {
	beforeEach( () => {
		mockGetConversations.mockReset();
	} );

	it( 'counts all conversations as open when no status map is provided (legacy behaviour)', () => {
		mockGetConversations.mockReturnValue( [
			makeConversation( 'a' ),
			makeConversation( 'b' ),
			makeConversation( 'c' ),
		] );

		expect( getOpenLiveInteractionCount() ).toBe( 3 );
		expect( hasReachedConversationLimit() ).toBe( true );
		expect( getMostRecentOpenLiveInteraction() ).toBe( 'a' );
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

		expect( getOpenLiveInteractionCount( statusMap ) ).toBe( 2 );
		expect( hasReachedConversationLimit( statusMap ) ).toBe( false );
		expect( getMostRecentOpenLiveInteraction( statusMap ) ).toBe( 'a' );
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

		expect( getOpenLiveInteractionCount( statusMap ) ).toBe( 1 );
		expect( hasReachedConversationLimit( statusMap ) ).toBe( false );
		expect( getMostRecentOpenLiveInteraction( statusMap ) ).toBe( 'b' );
	} );

	it( 'falls back to the heuristic for conversations missing from the map', () => {
		mockGetConversations.mockReturnValue( [
			makeConversation( 'a' ),
			makeConversation( 'b' ),
			makeConversation( 'c' ),
		] );

		// Empty map → all conversations fall back to the heuristic, all open.
		const emptyMap: InteractionStatusByUuid = new Map();
		expect( getOpenLiveInteractionCount( emptyMap ) ).toBe( 3 );
		expect( hasReachedConversationLimit( emptyMap ) ).toBe( true );
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

		expect( getOpenLiveInteractionCount( statusMap ) ).toBe( 1 );
		expect( getMostRecentOpenLiveInteraction( statusMap ) ).toBe( 'b' );
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

		expect( getOpenLiveInteractionCount( statusMap ) ).toBe( 1 );
	} );

	it( 'returns null from getMostRecentOpenLiveInteraction when nothing is open', () => {
		mockGetConversations.mockReturnValue( [ makeConversation( 'a' ) ] );

		const statusMap: InteractionStatusByUuid = new Map( [ [ 'a', 'closed' ] ] );

		expect( getMostRecentOpenLiveInteraction( statusMap ) ).toBeNull();
	} );

	it( 'exports MAX_OPEN_CONVERSATIONS = 3', () => {
		expect( MAX_OPEN_CONVERSATIONS ).toBe( 3 );
	} );
} );
