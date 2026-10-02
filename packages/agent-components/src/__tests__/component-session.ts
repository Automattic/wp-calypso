import { ComponentSession } from '../component-session';
import { applied, completed, negative, opening } from './fixtures';

function createSession(
	transport = jest.fn().mockResolvedValue( applied() ),
	onContinue = jest.fn().mockResolvedValue( undefined )
) {
	return {
		session: new ComponentSession( {
			result: opening(),
			transport,
			onContinue,
			createRequestId: () => 'request-123',
			locale: 'en-US',
		} ),
		transport,
		onContinue,
	};
}

describe( 'ComponentSession', () => {
	beforeEach( () => {
		jest.useFakeTimers().setSystemTime( new Date( '2026-09-30T10:00:00Z' ) );
	} );
	afterEach( () => {
		jest.clearAllTimers();
		jest.useRealTimers();
	} );
	it( 'submits only the saved reference, disables synchronously, commits before one continuation', async () => {
		let resolve: ( value: unknown ) => void = () => {};
		const transport = jest.fn().mockImplementation(
			() =>
				new Promise( ( done ) => {
					resolve = done;
				} )
		);
		const onContinue = jest.fn();
		const { session } = createSession( transport, onContinue );
		onContinue.mockImplementation( async () => {
			expect( session.getSnapshot().result ).toEqual( completed() );
		} );
		const submission = session.submit( 'tool.execute' );
		expect( session.getSnapshot().phase ).toBe( 'pending' );
		await session.submit( 'tool.execute' );
		expect( transport ).toHaveBeenCalledTimes( 1 );
		expect( transport ).toHaveBeenCalledWith( {
			protocol: 'agent-component/0.1',
			instanceId: 'instance-123',
			expectedRevision: 1,
			requestId: 'request-123',
			locale: 'en-US',
			event: { name: 'tool.execute', values: {} },
		} );
		resolve( applied() );
		await submission;
		await session.submit( 'tool.execute' );
		expect( onContinue ).toHaveBeenCalledTimes( 1 );
		expect( onContinue ).toHaveBeenCalledWith( completed().summary );
		expect( session.getSnapshot() ).toEqual( {
			result: completed(),
			phase: 'completed',
			error: null,
		} );
	} );

	it.each( [
		undefined,
		{},
		{ ...applied(), requestId: 'old-request' },
		negative( 'rejected' ),
		negative( 'stale' ),
		negative( 'indeterminate' ),
	] )( 'consumes invalid or uncertain attempts without continuation (%#)', async ( response ) => {
		const { session, transport, onContinue } = createSession(
			jest.fn().mockResolvedValue( response )
		);
		await session.submit( 'tool.execute' );
		await session.submit( 'tool.execute' );
		expect( session.getSnapshot().phase ).toBe( 'failed' );
		expect( session.getSnapshot().error ).toBeTruthy();
		expect( session.getSnapshot().result ).toEqual( opening() );
		expect( transport ).toHaveBeenCalledTimes( 1 );
		expect( onContinue ).not.toHaveBeenCalled();
	} );

	it( 'consumes a thrown transport without repeating it', async () => {
		const { session, transport, onContinue } = createSession(
			jest.fn().mockRejectedValue( new Error( 'Offline' ) )
		);
		await session.submit( 'tool.execute' );
		await session.submit( 'tool.execute' );
		expect( session.getSnapshot().phase ).toBe( 'failed' );
		expect( transport ).toHaveBeenCalledTimes( 1 );
		expect( onContinue ).not.toHaveBeenCalled();
	} );

	it( 'keeps verified completion when the single continuation fails', async () => {
		const { session, transport, onContinue } = createSession(
			undefined,
			jest.fn().mockRejectedValue( new Error( 'Busy' ) )
		);
		await session.submit( 'tool.execute' );
		await session.submit( 'tool.execute' );
		expect( session.getSnapshot().result ).toEqual( completed() );
		expect( session.getSnapshot().phase ).toBe( 'completed' );
		expect( session.getSnapshot().error ).toMatch( /agent could not continue/ );
		expect( transport ).toHaveBeenCalledTimes( 1 );
		expect( onContinue ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'still validates and continues a submitted action after presentation failure', async () => {
		const { session, transport, onContinue } = createSession();
		const submission = session.submit( 'tool.execute' );
		session.failPresentation();
		await submission;
		expect( session.getSnapshot().result ).toEqual( completed() );
		expect( session.getSnapshot().error ).toMatch( /could not be displayed/ );
		expect( transport ).toHaveBeenCalledTimes( 1 );
		expect( onContinue ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'contains subscriber exceptions without losing completion or continuation', async () => {
		const { session, onContinue } = createSession();
		session.subscribe( () => {
			throw new Error( 'Render failed' );
		} );
		await session.submit( 'tool.execute' );
		expect( session.getSnapshot().result ).toEqual( completed() );
		expect( session.getSnapshot().error ).toMatch( /could not be displayed/ );
		expect( onContinue ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'ignores undeclared actions and controls disabled before submission', async () => {
		const { session, transport } = createSession();
		await session.submit( 'other-action' );
		session.failPresentation();
		await session.submit( 'tool.execute' );
		expect( transport ).not.toHaveBeenCalled();
	} );

	it( 'never reactivates a completed result', async () => {
		const transport = jest.fn();
		const session = new ComponentSession( {
			result: completed(),
			transport,
			onContinue: jest.fn(),
		} );
		await session.submit( 'tool.execute' );
		expect( transport ).not.toHaveBeenCalled();
	} );
	it.each( [ 1000, 0 ] )( 'honors the authenticated expiry (%s ms)', async ( remaining ) => {
		const response = applied();
		response.current.expiresAt = new Date( Date.now() + remaining ).toISOString();
		const onExpire = jest.fn();
		const onContinue = jest.fn();
		const session = new ComponentSession( {
			result: opening(),
			transport: jest.fn().mockResolvedValue( response ),
			onContinue,
			createRequestId: () => 'request-123',
			onExpire,
		} );
		await session.submit( 'tool.execute' );
		expect( session.getSnapshot().result ).toEqual( remaining ? completed() : null );
		expect( onContinue ).toHaveBeenCalledTimes( remaining ? 1 : 0 );
		jest.advanceTimersByTime( remaining );
		expect( session.getSnapshot().result ).toBeNull();
		expect( onExpire ).toHaveBeenCalledTimes( 1 );
	} );

	it.each( [ 'expiry', 'disposal' ] )(
		'clears presentation on %s and ignores late completion',
		async ( reason ) => {
			let resolve: ( value: unknown ) => void = () => {};
			const transport = jest.fn(
				() =>
					new Promise( ( done ) => {
						resolve = done;
					} )
			);
			const { session, onContinue } = createSession( transport );
			const submission = session.submit( 'tool.execute' );
			if ( reason === 'expiry' ) {
				jest.advanceTimersByTime( 60 * 60 * 1000 );
			} else {
				session.dispose();
			}
			expect( session.getSnapshot().result ).toBeNull();
			resolve( applied() );
			await submission;
			await session.submit( 'tool.execute' );
			expect( transport ).toHaveBeenCalledTimes( 1 );
			expect( onContinue ).not.toHaveBeenCalled();
		}
	);

	it.each( [ 'pending', 'completed' ] )(
		'honors disposal during the %s notification',
		async ( phase ) => {
			const { session, transport, onContinue } = createSession();
			session.subscribe( () => {
				if ( session.getSnapshot().phase === phase ) {
					session.dispose();
				}
			} );
			await session.submit( 'tool.execute' );
			expect( transport ).toHaveBeenCalledTimes( phase === 'pending' ? 0 : 1 );
			expect( onContinue ).not.toHaveBeenCalled();
			expect( session.getSnapshot().result ).toBeNull();
			expect( jest.getTimerCount() ).toBe( 0 );
		}
	);
} );
