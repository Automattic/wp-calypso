import { mergeNewestPage } from '../unanswered-question';
import type { Message } from '@automattic/agenttic-client';

const row = ( serverId: number, text = `row ${ serverId }` ) =>
	( {
		role: 'agent',
		kind: 'message',
		parts: [ { type: 'text', text } ],
		messageId: `message-${ serverId }`,
		metadata: { serverId },
	} ) as unknown as Message;

describe( 'mergeNewestPage', () => {
	it( 'replaces the rows the newest page covers and keeps the older ones after it', () => {
		const loaded = [ row( 3, 'stale' ), row( 4 ), row( 1 ), row( 2 ) ];
		const newestPage = [ row( 3 ), row( 4 ), row( 5 ) ];

		expect( mergeNewestPage( loaded, newestPage ) ).toEqual( [
			row( 3 ),
			row( 4 ),
			row( 5 ),
			row( 1 ),
			row( 2 ),
		] );
	} );

	it( 'keeps the loaded conversation when the newest page is empty', () => {
		expect( mergeNewestPage( [ row( 1 ), row( 2 ) ], [] ) ).toEqual( [ row( 1 ), row( 2 ) ] );
	} );
} );
