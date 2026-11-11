export function createBlackboxInstance( initialState = { status: 'ready', sessionId: 'sid' } ) {
	let snapshot = Object.freeze( initialState );
	const listeners = new Set();
	const setState = ( state ) => {
		snapshot = Object.freeze( state );
		listeners.forEach( ( listener ) => listener( snapshot ) );
	};
	const api = {
		configure: jest.fn(),
		reset: jest.fn( () => setState( { status: 'loading' } ) ),
		getSnapshot: () => snapshot,
		subscribe: ( listener ) => {
			listeners.add( listener );
			listener( snapshot );
			return () => listeners.delete( listener );
		},
		flush: jest.fn( async () => ( {
			sessionId: snapshot.sessionId ?? '',
			challengePending: snapshot.status === 'challenge',
			outcome: 'ok',
		} ) ),
	};
	return { api, setState, listeners };
}
