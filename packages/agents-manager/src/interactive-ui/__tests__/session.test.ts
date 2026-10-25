import {
	disposeInteractiveUiRuntime,
	getInteractiveUiSession,
	getShownInteractiveUiDataModel,
	showInteractiveUiSession,
	trackInteractiveUiHistory,
} from '../session';
import { createBatch, createRuntime, formOperations } from './fixtures/surface';
import type { InteractiveUiDataModel, InteractiveUiRuntime } from '@automattic/ai-ui-renderer';

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

describe( 'disposeInteractiveUiRuntime', () => {
	it( 'disposes of the runtime and forgets its batches, so they apply again', () => {
		const dispose = jest.fn();
		const session = getInteractiveUiSession( undefined, SCOPE, 'session-1' );
		session.runtime = { dispose } as unknown as InteractiveUiRuntime;
		session.appliedBatches = [ { ...createBatch( [], 'agent' ), hasRejections: false } ];

		disposeInteractiveUiRuntime( session );

		expect( dispose ).toHaveBeenCalledTimes( 1 );
		expect( session ).toMatchObject( { runtime: undefined, appliedBatches: [] } );
	} );
} );

describe( 'showInteractiveUiSession', () => {
	// A session whose runtime gives this data.
	function createSession( sessionId: string, dataModel: InteractiveUiDataModel ) {
		const session = getInteractiveUiSession( undefined, SCOPE, sessionId );
		session.runtime = { getDataModel: () => dataModel } as unknown as InteractiveUiRuntime;

		return session;
	}

	const dataModel: InteractiveUiDataModel = {
		version: 'v1.0',
		surfaces: { form: { name: 'Ada' } },
	};

	it( 'shows a session until its chat stops showing it, unless another replaced it', () => {
		const replacedDataModel: InteractiveUiDataModel = { version: 'v1.0', surfaces: {} };

		const hideReplaced = showInteractiveUiSession(
			createSession( 'session-1', replacedDataModel )
		);
		const hide = showInteractiveUiSession( createSession( 'session-2', dataModel ) );

		hideReplaced();

		expect( getShownInteractiveUiDataModel() ).toBe( dataModel );

		hide();

		expect( getShownInteractiveUiDataModel() ).toBeUndefined();
	} );
} );

describe( 'getShownInteractiveUiDataModel', () => {
	let hide: () => void;

	afterEach( () => hide() );

	// Shows a session whose runtime has a form that sends its data.
	function showFormSession() {
		const session = getInteractiveUiSession( undefined, SCOPE, 'session-1' );
		session.runtime = createRuntime();
		session.runtime.processMessages( formOperations, 'agent' );

		hide = showInteractiveUiSession( session );

		return session;
	}

	it( 'gives the data of the surfaces the user could use before sending', () => {
		const session = showFormSession();

		expect( getShownInteractiveUiDataModel() ).toBeUndefined();

		session.usableSurfaceIds = [ 'form' ];

		expect( getShownInteractiveUiDataModel() ).toEqual( {
			version: 'v1.0',
			surfaces: { form: { name: 'Ada' } },
		} );
	} );

	it( 'gives nothing instead of throwing, which would drop the message’s other metadata', () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		const session = getInteractiveUiSession( undefined, SCOPE, 'session-1' );
		session.runtime = {
			getDataModel: () => {
				throw new Error( 'Broken' );
			},
		} as unknown as InteractiveUiRuntime;

		hide = showInteractiveUiSession( session );

		expect( getShownInteractiveUiDataModel() ).toBeUndefined();

		consoleError.mockRestore();
	} );
} );

describe( 'trackInteractiveUiHistory', () => {
	const batch = createBatch( [], 'agent' );

	function createHistory() {
		return getInteractiveUiSession( undefined, SCOPE, 'session-1' ).history;
	}

	it( 'records the batches in the transcript before the first turn', () => {
		const history = createHistory();

		trackInteractiveUiHistory( history, { isProcessing: false, batches: [ batch ] } );

		expect( history.restoredMessageIds ).toEqual( new Set( [ 'agent' ] ) );
	} );

	it( 'keeps recording after the previous conversation’s reply, still in progress after a switch', () => {
		const history = createHistory();

		trackInteractiveUiHistory( history, { isProcessing: true, batches: [] } );
		trackInteractiveUiHistory( history, { isProcessing: false, batches: [ batch ] } );

		expect( history.restoredMessageIds.has( 'agent' ) ).toBe( true );
	} );

	it( 'stops recording once a reply starts, even one that adds no message, such as a resumed tool call', () => {
		const history = createHistory();

		trackInteractiveUiHistory( history, { isProcessing: false, batches: [] } );
		trackInteractiveUiHistory( history, { isProcessing: true, batches: [] } );
		trackInteractiveUiHistory( history, { isProcessing: false, batches: [ batch ] } );

		expect( history.restoredMessageIds.size ).toBe( 0 );
	} );
} );
