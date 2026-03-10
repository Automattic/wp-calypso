import { ObservableV2 } from 'lib0/observable';
import { Awareness } from 'y-protocols/awareness';
import { pinghubManager } from './pinghub-manager';
import type { ConnectionStatus, ProviderCreator, ProviderCreatorResult } from '../../sync-types';
import type * as Y from 'yjs';

interface ProviderOptions {
	awareness?: Awareness;
	debug?: boolean;
	room: string;
	ydoc: Y.Doc;
}

type PingHubEvents = {
	status: ( status: ConnectionStatus ) => void;
};

/**
 * Yjs provider that uses PingHub WebSockets for real-time synchronization.
 * Thin shell that delegates transport, sync protocol, and reconnection to
 * the shared pinghub-manager module.
 */
class PingHubProvider extends ObservableV2< PingHubEvents > {
	protected readonly awareness: Awareness;
	protected status: ConnectionStatus[ 'status' ] = 'disconnected';
	protected synced = false;
	public constructor( private readonly options: ProviderOptions ) {
		super();
		this.log( 'Initializing', { room: options.room } );

		this.awareness = options.awareness ?? new Awareness( options.ydoc );
		this.connect();
	}

	/**
	 * Connect to the endpoint and initialize sync.
	 */
	public connect(): void {
		this.log( 'Connecting' );

		pinghubManager.registerRoom( {
			room: this.options.room,
			doc: this.options.ydoc,
			awareness: this.awareness,
			onStatusChange: this.emitStatus,
			onSync: this.onSync,
		} );
	}

	/**
	 * Disconnect the provider and allow reconnection later.
	 */
	public disconnect(): void {
		this.log( 'Disconnecting' );

		pinghubManager.unregisterRoom( this.options.room );
		this.emitStatus( { status: 'disconnected' } );
	}

	/**
	 * Destroy the provider and cleanup resources.
	 */
	public override destroy(): void {
		this.disconnect();
		super.destroy();
	}

	/**
	 * Emit connection status, mirroring HttpPollingProvider semantics:
	 * - Avoid duplicate emissions for the same status (unless there is an error).
	 * - Only emit `connecting` when transitioning from `disconnected`.
	 *
	 * @param connectionStatus - Connection status object.
	 */
	protected emitStatus = ( connectionStatus: ConnectionStatus ): void => {
		const error = connectionStatus.status === 'disconnected' ? connectionStatus.error : undefined;
		const { status } = connectionStatus;

		if ( this.status === status && ! error ) {
			return;
		}
		if ( status === 'connecting' && this.status !== 'disconnected' ) {
			return;
		}

		this.log( 'Status change', { status, error } );

		this.status = status;
		this.emit( 'status', [ connectionStatus ] );
	};

	/**
	 * Log debug messages if debugging is enabled.
	 *
	 * @param message - Log message.
	 * @param debug   - Optional debug context.
	 */
	protected log = ( message: string, debug: object = {} ): void => {
		if ( this.options.debug ) {
			// eslint-disable-next-line no-console
			console.log( `[${ this.constructor.name }]: ${ message }`, {
				room: this.options.room,
				...debug,
			} );
		}
	};

	/**
	 * Handle synchronization events from the manager.
	 */
	protected onSync = (): void => {
		if ( ! this.synced ) {
			this.synced = true;
			this.log( 'Synced' );
		}
	};
}

/**
 * Build a room name from an object type and ID.
 *
 * @param objectType - The type of the object.
 * @param objectId   - The ID of the object.
 * @returns The room name (e.g. "postType-post-42").
 */
function getRoom( objectType: string, objectId: string | null ): string {
	const normalizedType = objectType.replaceAll( '/', '-' );
	const id = objectId ?? 'collection';
	return `${ normalizedType }-${ id }`;
}

/**
 * Create a provider creator function for the PingHubProvider.
 *
 * @returns Provider creator compatible with the sync manager.
 */
export function createPingHubProvider(): ProviderCreator {
	return async ( { awareness, objectType, objectId, ydoc } ): Promise< ProviderCreatorResult > => {
		/**
		 * Only post-like entities with a concrete ID are supported now.
		 */
		const SUPPORTED_OBJECT_TYPES = new Set( [ 'postType/post', 'postType/page' ] );
		if ( ! SUPPORTED_OBJECT_TYPES.has( objectType ) || ! objectId ) {
			return {
				destroy: () => {},
				on: () => {},
			};
		}

		const room = getRoom( objectType, objectId );
		const provider = new PingHubProvider( {
			awareness,
			room,
			ydoc,
		} );

		return {
			destroy: () => provider.destroy(),
			on: ( event, callback ) => {
				provider.on( event, callback );
			},
		};
	};
}
