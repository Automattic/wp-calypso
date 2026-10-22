import { getInteractiveUiSession, trackInteractiveUiHistory } from '../session';

const SCOPE = JSON.stringify( [ 'site', 1, 'agent' ] );

describe( 'getInteractiveUiSession', () => {
	it( 'keeps the session through a new chat’s bootstrap', () => {
		const session = getInteractiveUiSession( undefined, SCOPE, '' );

		expect( getInteractiveUiSession( session, SCOPE, 'session-1' ) ).toBe( session );
	} );

	it.each( [
		[ 'another conversation', SCOPE, 'session-2' ],
		[ 'another site', JSON.stringify( [ 'other-site', 1, 'agent' ] ), 'session-1' ],
	] )( 'starts a new session for %s', ( _description, scopeIdentity, sessionId ) => {
		const session = getInteractiveUiSession( undefined, SCOPE, 'session-1' );

		expect( getInteractiveUiSession( session, scopeIdentity, sessionId ) ).not.toBe( session );
	} );
} );

describe( 'trackInteractiveUiHistory', () => {
	const batch = { operations: [], messageId: 'agent', messageIndex: 1, signature: 'restored' };

	function createHistory() {
		return getInteractiveUiSession( undefined, SCOPE, 'session-1' ).history;
	}

	it( 'records the batches in the transcript before the first turn', () => {
		const history = createHistory();

		trackInteractiveUiHistory( history, { isProcessing: false, batches: [ batch ] } );

		expect( history.restoredSignatures ).toEqual( new Set( [ 'restored' ] ) );
	} );

	it( 'keeps recording after the previous conversation’s reply, still in progress after a switch', () => {
		const history = createHistory();

		trackInteractiveUiHistory( history, { isProcessing: true, batches: [] } );
		trackInteractiveUiHistory( history, { isProcessing: false, batches: [ batch ] } );

		expect( history.restoredSignatures.has( 'restored' ) ).toBe( true );
	} );

	it( 'stops recording once a reply starts, even one that adds no message, such as a resumed tool call', () => {
		const history = createHistory();

		trackInteractiveUiHistory( history, { isProcessing: false, batches: [] } );
		trackInteractiveUiHistory( history, { isProcessing: true, batches: [] } );
		trackInteractiveUiHistory( history, { isProcessing: false, batches: [ batch ] } );

		expect( history.restoredSignatures.size ).toBe( 0 );
	} );
} );
