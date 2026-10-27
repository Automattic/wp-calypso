/**
 * @jest-environment jsdom
 */
import { getClientId } from '../utils';
import type { ZendeskConversation, ZendeskMessage } from '@automattic/zendesk-client';

jest.mock( 'smooch', () => ( {} ) );

const conversation = ( sources: Partial< ZendeskMessage[ 'source' ] >[] ) =>
	( {
		messages: sources.map( ( source ) => ( { source } ) ),
	} ) as unknown as ZendeskConversation;

describe( 'getClientId', () => {
	it( "picks the client of the chat's integration over another integration's", () => {
		const conversations = [
			conversation( [ { type: 'web', id: 'wpcom-client', integrationId: 'wpcom' } ] ),
			conversation( [ { type: 'web', id: 'woo-client', integrationId: 'woo' } ] ),
		];

		expect( getClientId( conversations, 'woo' ) ).toBe( 'woo-client' );
		expect( getClientId( conversations, 'wpcom' ) ).toBe( 'wpcom-client' );
	} );

	it( 'returns no client when only other integrations have one', () => {
		const conversations = [
			conversation( [ { type: 'web', id: 'wpcom-client', integrationId: 'wpcom' } ] ),
		];

		expect( getClientId( conversations, 'woo' ) ).toBe( '' );
	} );

	it( "counts messages that don't name their integration", () => {
		const conversations = [ conversation( [ { type: 'web', id: 'client' } ] ) ];

		expect( getClientId( conversations, 'woo' ) ).toBe( 'client' );
	} );

	it( 'ignores messages that were not sent from the web', () => {
		const conversations = [
			conversation( [
				{ type: 'zd:answerBot', id: 'bot', integrationId: 'woo' },
				{ type: 'web', id: 'woo-client', integrationId: 'woo' },
			] ),
		];

		expect( getClientId( conversations, 'woo' ) ).toBe( 'woo-client' );
	} );
} );
