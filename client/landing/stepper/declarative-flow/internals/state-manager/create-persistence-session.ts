import { createSessionId } from './create-session-id';

const VERSION = 1;
const DB_KEY = 'stepper-persistence-sessions';

export class StepperPersistenceManager {
	database: IDBDatabase | null = null;
	initiated = false;
	async initiate() {
		const openRequest = indexedDB.open( DB_KEY, VERSION );
		return new Promise< void >( ( resolve ) => {
			openRequest.onupgradeneeded = ( event ) => {
				const db = ( event.currentTarget as IDBOpenDBRequest ).result;
				if ( ! db.objectStoreNames.contains( 'sessions' ) ) {
					db.createObjectStore( 'sessions', { keyPath: 'id' } );
				}
			};

			openRequest.onsuccess = ( event ) => {
				this.database = ( event.target as IDBOpenDBRequest ).result;
				this.initiated = true;

				this.database.onversionchange = () => {
					this.database?.close();
				};

				resolve();
			};

			// openRequest.onerror = (event) => {
			// 	// console.error('Error opening database:', (event.target as IDBOpenDBRequest).error);
			// };
		} );
	}
	async createSession() {
		if ( ! this.initiated ) {
			await this.initiate();
		}

		if ( ! this.database ) {
			return;
		}

		const transaction = this.database.transaction( 'sessions', 'readwrite' );
		const store = transaction.objectStore( 'sessions' );
		const sessionId = createSessionId();

		return new Promise< string >( ( resolve ) => {
			const request = store.add( { id: sessionId } );
			request.onsuccess = () => {
				resolve( sessionId );
			};
			request.onerror = () => {
				// In the unlikely event that the session ID is already taken, try again.
				// And overwrite this time. If the user is this unlucky, they deserve it 😅.
				const sessionId = createSessionId();
				store.put( { id: sessionId } ).onsuccess = () => {
					resolve( sessionId );
				};
			};
		} );
	}
}
