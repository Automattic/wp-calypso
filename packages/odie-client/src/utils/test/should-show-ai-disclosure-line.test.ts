import { shouldShowAiDisclosureLine } from '../should-show-ai-disclosure-line';
import type { Chat, SupportInteraction, SupportProvider } from '../../types';

function makeChat( overrides: Partial< Chat > = {} ): Chat {
	return {
		odieId: null,
		conversationId: null,
		messages: [],
		provider: 'odie',
		status: 'loaded',
		...overrides,
	} as Chat;
}

function makeInteraction( sources: SupportProvider[] ): SupportInteraction {
	return {
		uuid: 'interaction-1',
		status: 'open',
		events: sources.map( ( event_source, index ) => ( {
			event_external_id: String( index ),
			event_source,
		} ) ),
	} as SupportInteraction;
}

describe( 'shouldShowAiDisclosureLine', () => {
	it( 'shows while the AI is in the chat', () => {
		expect(
			shouldShowAiDisclosureLine( {
				chat: makeChat(),
				interaction: makeInteraction( [ 'odie' ] ),
				isChatPending: false,
			} )
		).toBe( true );
	} );

	it( 'hides while the chat is pending', () => {
		expect(
			shouldShowAiDisclosureLine( {
				chat: makeChat(),
				interaction: makeInteraction( [ 'odie' ] ),
				isChatPending: true,
			} )
		).toBe( false );
	} );

	it.each( [ 'zendesk', 'zendesk-staging' ] as SupportProvider[] )(
		'hides once the chat is with a person (%s)',
		( provider ) => {
			expect(
				shouldShowAiDisclosureLine( {
					chat: makeChat( { provider } ),
					interaction: makeInteraction( [ 'odie' ] ),
					isChatPending: false,
				} )
			).toBe( false );
		}
	);

	it( 'hides while a chat with a Zendesk event is in transfer, even if the provider still says odie', () => {
		expect(
			shouldShowAiDisclosureLine( {
				chat: makeChat( { status: 'transfer' } ),
				interaction: makeInteraction( [ 'odie', 'zendesk' ] ),
				isChatPending: false,
			} )
		).toBe( false );
	} );

	it( 'keeps the line while a chat refreshes after a failed handoff', () => {
		expect(
			shouldShowAiDisclosureLine( {
				chat: makeChat( { status: 'loading', messages: [ {} as Chat[ 'messages' ][ number ] ] } ),
				interaction: makeInteraction( [ 'odie', 'zendesk' ] ),
				isChatPending: false,
			} )
		).toBe( true );
	} );

	it( 'shows again after a failed handoff, when the AI is answering', () => {
		expect(
			shouldShowAiDisclosureLine( {
				chat: makeChat( { provider: 'odie', status: 'loaded' } ),
				interaction: makeInteraction( [ 'odie', 'zendesk' ] ),
				isChatPending: false,
			} )
		).toBe( true );
	} );

	it( 'shows on a closed AI chat', () => {
		expect(
			shouldShowAiDisclosureLine( {
				chat: makeChat( { status: 'closed' } ),
				interaction: makeInteraction( [ 'odie' ] ),
				isChatPending: false,
			} )
		).toBe( true );
	} );

	it( 'shows when there is no interaction yet', () => {
		expect(
			shouldShowAiDisclosureLine( {
				chat: makeChat(),
				interaction: undefined,
				isChatPending: false,
			} )
		).toBe( true );
	} );

	it( 'shows without crashing when there is no chat yet', () => {
		expect(
			shouldShowAiDisclosureLine( {
				chat: undefined as unknown as Chat,
				interaction: undefined,
				isChatPending: false,
			} )
		).toBe( true );
	} );
} );
