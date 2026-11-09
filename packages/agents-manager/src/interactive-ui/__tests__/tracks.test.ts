import { BASIC_CATALOG_ID } from '@automattic/ai-ui-renderer/capabilities';
import { recordAgentsManagerTracksEvent } from '../../utils/tracks';
import { applyInteractiveUiBatch } from '../messages';
import { disposeInteractiveUiRuntime, getInteractiveUiSession } from '../session';
import {
	recordInteractiveUiAction,
	recordRenderedInteractiveUiSurfaces,
	reportInteractiveUiError,
} from '../tracks';
import { createBatch, createRuntime, operations } from './fixtures/surface';
import type { InteractiveUiBatch } from '../messages';
import type { InteractiveUiSession } from '../session';

jest.mock( '../../utils/tracks', () => ( { recordAgentsManagerTracksEvent: jest.fn() } ) );

beforeEach( () => jest.mocked( recordAgentsManagerTracksEvent ).mockClear() );

const batch = createBatch( operations, 'agent' );

function createSession( batches: InteractiveUiBatch[] = [], runtime = createRuntime() ) {
	const session = getInteractiveUiSession( undefined, 'scope', 'session-1' );
	session.runtime = runtime;

	session.appliedBatches = batches.map( ( applied ) =>
		applyInteractiveUiBatch( runtime, applied )
	);

	return session;
}

describe( 'reportInteractiveUiError', () => {
	let consoleError: jest.SpyInstance;

	const renderFailed = {
		code: 'RENDER_FAILED',
		message: 'Agent content',
		surfaceId: 'test-surface',
	};

	beforeEach( () => {
		consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	} );

	afterEach( () => consoleError.mockRestore() );

	it( 'records the error’s code and its surface’s ID and catalog, without its message', () => {
		reportInteractiveUiError( renderFailed, 'agent', createSession( [ batch ] ) );

		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_interactive_ui_error',
			{ error_code: 'RENDER_FAILED', surface_id: 'test-surface', catalog_id: BASIC_CATALOG_ID }
		);
	} );

	it( 'records only the code of an error on a surface the runtime doesn’t have', () => {
		reportInteractiveUiError(
			{ code: 'VALIDATION_ERROR', message: 'Agent content', surfaceId: 'missing-surface' },
			'agent',
			createSession()
		);

		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_interactive_ui_error',
			{ error_code: 'VALIDATION_ERROR' }
		);
	} );

	it( 'records each error once a message, however often it recurs', () => {
		const session = createSession();
		const surfaceless = { code: 'VALIDATION_ERROR', message: 'Agent content' };

		reportInteractiveUiError( renderFailed, 'agent', session );
		reportInteractiveUiError( renderFailed, 'agent', session );
		reportInteractiveUiError( { ...renderFailed, message: 'Other content' }, 'agent', session );
		reportInteractiveUiError( renderFailed, 'agent-2', session );
		reportInteractiveUiError( surfaceless, 'agent', session );
		reportInteractiveUiError( surfaceless, 'agent', session );
		reportInteractiveUiError( surfaceless, 'agent-2', session );

		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledTimes( 5 );
		expect( consoleError ).toHaveBeenCalledTimes( 5 );
	} );

	it( 'only logs an error from a message restored from history', () => {
		const session = createSession();
		session.history.restoredMessageIds.add( 'agent' );

		reportInteractiveUiError( renderFailed, 'agent', session );

		expect( consoleError ).toHaveBeenCalledTimes( 1 );
		expect( recordAgentsManagerTracksEvent ).not.toHaveBeenCalled();
	} );
} );

describe( 'recordRenderedInteractiveUiSurfaces', () => {
	function rebuild( session: InteractiveUiSession ) {
		disposeInteractiveUiRuntime( session );
		session.runtime = createRuntime();
		session.appliedBatches = [ applyInteractiveUiBatch( session.runtime, batch ) ];
	}

	it( 'records a live surface by its ID, catalog and root component', () => {
		recordRenderedInteractiveUiSurfaces( createSession( [ batch ] ) );

		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_interactive_ui_rendered',
			{ surface_id: 'test-surface', catalog_id: BASIC_CATALOG_ID, component_type: 'Text' }
		);
	} );

	it( 'doesn’t record a surface restored from history, even once a rebuild applies it again', () => {
		const session = createSession( [ batch ] );
		session.history.restoredMessageIds.add( 'agent' );

		recordRenderedInteractiveUiSurfaces( session );
		rebuild( session );
		recordRenderedInteractiveUiSurfaces( session );

		expect( recordAgentsManagerTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'records a surface once its root component arrives', () => {
		const [ create, update ] = operations;
		const runtime = createRuntime();
		const session = createSession( [ createBatch( [ create ], 'agent' ) ], runtime );

		recordRenderedInteractiveUiSurfaces( session );

		expect( recordAgentsManagerTracksEvent ).not.toHaveBeenCalled();

		session.appliedBatches = [
			...session.appliedBatches,
			applyInteractiveUiBatch( runtime, createBatch( [ update ], 'later' ) ),
		];
		recordRenderedInteractiveUiSurfaces( session );

		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'records a surface once a session, though a rebuild applies it again', () => {
		const session = createSession( [ batch ] );

		recordRenderedInteractiveUiSurfaces( session );
		rebuild( session );
		recordRenderedInteractiveUiSurfaces( session );

		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );
} );

describe( 'recordInteractiveUiAction', () => {
	it( 'records the surface and the component that sent an action, without its name or context', () => {
		const session = createSession( [ batch ] );

		recordInteractiveUiAction(
			{
				name: 'submit',
				surfaceId: 'test-surface',
				sourceComponentId: 'root',
				timestamp: '2026-10-24T00:00:00.000Z',
				context: { email: 'user@example.com' },
			},
			session
		);

		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_interactive_ui_action',
			{ surface_id: 'test-surface', catalog_id: BASIC_CATALOG_ID, component_type: 'Text' }
		);
	} );
} );
