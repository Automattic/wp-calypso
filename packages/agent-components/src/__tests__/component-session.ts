import { ComponentSession } from '../component-session';
import { applied, completed, negative, opening } from './fixtures';
import type { ComponentActionResponse, ComponentOpening } from '../types';

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
			allowedActions: new Set(),
			actionBindings: {},
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

	it( 'updates current and future shell messages without restoring actions or repeating attempts', async () => {
		const { session, transport, onContinue } = createSession(
			jest.fn().mockRejectedValue( new Error( 'Offline' ) )
		);
		await session.submit( 'tool.execute' );
		expect( session.getSnapshot().phase ).toBe( 'failed' );
		const result = session.getSnapshot().result;
		const messages = {
			presentationFailure: 'Impossible à afficher.',
			invalidInput: 'Vérifiez les valeurs.',
			unverifiedOutcome: 'Résultat inconnu.',
			expired: 'Action expirée.',
			continuationFailure: 'Impossible de continuer.',
		};
		session.updateMessages( messages );
		expect( session.getSnapshot().error ).toBe( messages.unverifiedOutcome );
		expect( session.getSnapshot().result ).toBe( result );
		const snapshot = session.getSnapshot();
		session.updateMessages( { ...messages } );
		expect( session.getSnapshot() ).toBe( snapshot );
		await session.submit( 'tool.execute' );
		expect( transport ).toHaveBeenCalledTimes( 1 );
		expect( onContinue ).not.toHaveBeenCalled();
		jest.advanceTimersByTime( 60 * 60 * 1000 );
		expect( session.getSnapshot().error ).toBe( messages.expired );
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
		const onExpire = jest.fn();
		const session = new ComponentSession( {
			result: completed(),
			transport,
			onContinue: jest.fn(),
			onExpire,
		} );
		await session.submit( 'tool.execute' );
		expect( transport ).not.toHaveBeenCalled();
		jest.advanceTimersByTime( 60 * 60 * 1000 );
		expect( session.getSnapshot().result ).toBeNull();
		expect( onExpire ).toHaveBeenCalledTimes( 1 );
		jest.advanceTimersByTime( 60 * 60 * 1000 );
		expect( onExpire ).toHaveBeenCalledTimes( 1 );
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

	function form(): ComponentOpening {
		return {
			protocol: 'agent-component/0.1',
			result: {
				...opening(),
				component: 'ability-form',
				surface: {
					protocol: 'minimal-ai-ui/0.1',
					rootId: 'root',
					components: {
						root: { id: 'root', type: 'Column', children: [ 'name', 'display', 'run' ] },
						name: {
							id: 'name',
							type: 'TextField',
							label: 'Name',
							path: '/name',
							inputMode: 'shortText',
							required: true,
						},
						display: {
							id: 'display',
							type: 'Text',
							variant: 'body',
							content: { path: '/site' },
						},
						run: {
							id: 'run',
							type: 'Button',
							label: 'Save name',
							action: 'save',
							variant: 'primary',
						},
					},
					data: { name: 'Old name', site: 'Example Site' },
				},
			},
			allowedActions: [ 'save' ],
			actionBindings: { save: [ '/name' ] },
			expiresAt: new Date( Date.now() + 30 * 60 * 1000 ).toISOString(),
		};
	}

	it.each( [ 'applied', 'failed' ] as const )(
		'keeps a %s replacement interactive and submits its next revision',
		async ( outcome ) => {
			const metadata = form();
			const updated = {
				...metadata.result,
				revision: 2,
				surface: {
					...metadata.result.surface,
					data: { name: 'Saved name', site: 'Example Site' },
				},
			};
			const response: ComponentActionResponse = {
				...applied( 'request-1' ),
				outcome,
				current: {
					...applied( 'request-1' ).current,
					state: 'awaiting-input',
					request: { state: 'settled', requestId: 'request-1', outcome, revision: 2 },
					result: updated,
					allowedActions: [ 'save' ],
					actionBindings: { save: [ '/name' ] },
				},
			};
			const terminal = applied( 'request-2' );
			terminal.current.revision = 3;
			terminal.current.request.revision = 3;
			terminal.current.result.revision = 3;
			terminal.current.result.component = 'ability-form';
			const transport = jest
				.fn()
				.mockResolvedValueOnce( response )
				.mockResolvedValueOnce( terminal );
			const onContinue = jest.fn().mockResolvedValue( undefined );
			let requestId = 0;
			const session = new ComponentSession( {
				...metadata,
				transport,
				onContinue,
				createRequestId: () => `request-${ ++requestId }`,
			} );
			const submission = session.submit( { name: 'save', values: { '/name': 'Saved name' } } );
			await session.submit( { name: 'save', values: { '/name': 'Duplicate' } } );
			await submission;
			expect( transport ).toHaveBeenCalledTimes( 1 );
			expect( session.getSnapshot().result ).toEqual( updated );
			expect( session.getSnapshot().phase ).toBe( 'ready' );
			expect( onContinue ).not.toHaveBeenCalled();
			await session.submit( { name: 'save', values: { '/name': 'Another name' } } );
			expect( transport.mock.calls[ 1 ][ 0 ] ).toMatchObject( {
				expectedRevision: 2,
				requestId: 'request-2',
			} );
			expect( session.getSnapshot().phase ).toBe( 'completed' );
			expect( onContinue ).toHaveBeenCalledTimes( 1 );
			session.dispose();
		}
	);

	it( 'requires authenticated eligibility for forms and freezes editable-only submissions', async () => {
		const metadata = form();
		const transport = jest.fn().mockResolvedValue( undefined );
		const onContinue = jest.fn();
		expect(
			() => new ComponentSession( { result: metadata.result, transport, onContinue } )
		).toThrow();
		expect(
			() =>
				new ComponentSession( { ...metadata, actionBindings: undefined, transport, onContinue } )
		).toThrow();
		const session = new ComponentSession( {
			...metadata,
			transport,
			onContinue,
			createRequestId: () => 'request-123',
		} );
		await session.submit( {
			name: 'save',
			values: { '/name': 'New name', '/site': 'Other Site' },
		} );
		await session.submit( 'save' );
		await session.submit( { name: 'save', values: { '/name': 'x'.repeat( 8193 ) } } );
		expect( transport ).not.toHaveBeenCalled();
		expect( session.getSnapshot().phase ).toBe( 'ready' );
		expect( session.getSnapshot().error ).toBe( 'Check the form values and try again.' );
		const event = { name: 'save', values: { '/name': 'New name' } };
		const submission = session.submit( event );
		event.values[ '/name' ] = 'Later edit';
		await submission;
		expect( transport ).toHaveBeenCalledWith( {
			protocol: 'agent-component/0.1',
			instanceId: metadata.result.instanceId,
			expectedRevision: 1,
			requestId: 'request-123',
			event: { name: 'save', values: { '/name': 'New name' } },
		} );
		expect( session.getSnapshot().phase ).toBe( 'failed' );
		expect( session.getSnapshot().allowedActions.size ).toBe( 0 );
	} );

	it( 'accepts a field-error replacement then continues one confirmed terminal failure', async () => {
		const metadata = form();
		const replacement = {
			...metadata.result,
			revision: 2,
			surface: {
				...metadata.result.surface,
				components: {
					...metadata.result.surface.components,
					name: {
						...metadata.result.surface.components.name,
						validationMessage: 'Choose another name.',
					},
				},
			},
		};
		const fieldError: ComponentActionResponse = {
			protocol: 'agent-component/0.1',
			requestId: 'request-1',
			outcome: 'invalid-input',
			current: {
				protocol: 'agent-component/0.1',
				resolvedLocale: 'en-US',
				request: {
					state: 'settled',
					requestId: 'request-1',
					outcome: 'invalid-input',
					revision: 2,
				},
				state: 'awaiting-input',
				instanceId: metadata.result.instanceId,
				revision: 2,
				result: replacement,
				allowedActions: metadata.allowedActions,
				actionBindings: metadata.actionBindings,
				expiresAt: metadata.expiresAt,
			},
		};
		const terminal: ComponentActionResponse = {
			...applied( 'request-2' ),
			outcome: 'failed',
			current: {
				...applied( 'request-2' ).current,
				request: { state: 'settled', requestId: 'request-2', outcome: 'failed', revision: 3 },
				revision: 3,
				result: {
					...completed(),
					component: 'ability-form',
					revision: 3,
					summary: 'The name could not be saved.',
				},
			},
		};
		const transport = jest
			.fn()
			.mockResolvedValueOnce( fieldError )
			.mockResolvedValueOnce( terminal );
		const onContinue = jest.fn().mockResolvedValue( undefined );
		let requestId = 0;
		const session = new ComponentSession( {
			...metadata,
			transport,
			onContinue,
			createRequestId: () => `request-${ ++requestId }`,
			locale: 'en-US',
		} );
		const submission = session.submit( { name: 'save', values: { '/name': 'Invalid name' } } );
		session.updateLocale( 'fr' );
		session.updateLocale( 'invalid_locale' );
		await submission;
		expect( transport.mock.calls[ 0 ][ 0 ].locale ).toBe( 'en-US' );
		expect( session.getSnapshot().phase ).toBe( 'ready' );
		expect( session.getSnapshot().result?.revision ).toBe( 2 );
		expect( onContinue ).not.toHaveBeenCalled();
		await session.submit( { name: 'save', values: { '/name': 'Corrected name' } } );
		expect( transport.mock.calls[ 1 ][ 0 ] ).toMatchObject( {
			requestId: 'request-2',
			expectedRevision: 2,
			locale: 'fr',
			event: { name: 'save', values: { '/name': 'Corrected name' } },
		} );
		expect( session.getSnapshot().phase ).toBe( 'completed' );
		expect( onContinue ).toHaveBeenCalledWith( 'The name could not be saved.' );
		await session.submit( { name: 'save', values: { '/name': 'Again' } } );
		expect( transport ).toHaveBeenCalledTimes( 2 );
		expect( onContinue ).toHaveBeenCalledTimes( 1 );
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
			expect( session.getSnapshot().allowedActions.size ).toBe( 0 );
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
