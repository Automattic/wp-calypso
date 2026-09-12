jest.mock( '@automattic/data-stores', () => ( {
	AgentsManager: {
		register: jest.fn( () => 'automattic/agents-manager' ),
		persistAgentsManagerState: jest.fn(),
	},
} ) );

jest.mock( '../utils/uses-local-state-persistence', () => ( {
	usesLocalStatePersistence: jest.fn(),
} ) );

jest.mock( '../utils/get-agents-manager-inline-data', () => ( {
	getAgentsManagerInlineData: jest.fn( () => ( { agentId: 'test-agent' } ) ),
} ) );

import { AgentsManager } from '@automattic/data-stores';
import { usesLocalStatePersistence } from '../utils/uses-local-state-persistence';
import '../stores';

const mockRegister = AgentsManager.register as jest.MockedFunction< typeof AgentsManager.register >;
const mockUsesLocalStatePersistence = usesLocalStatePersistence as jest.MockedFunction<
	typeof usesLocalStatePersistence
>;

describe( 'Agents Manager store', () => {
	it( 'uses the per-user server store only for hosts that do not persist locally', () => {
		const shouldUsePersistedState = mockRegister.mock.calls[ 0 ]?.[ 0 ]?.shouldUsePersistedState;
		if ( ! shouldUsePersistedState ) {
			throw new Error( 'Expected the store to register a persisted-state callback.' );
		}

		// A logged-in host (wp-admin sidebar, Big Sky): server state as before.
		mockUsesLocalStatePersistence.mockReturnValue( false );
		expect( shouldUsePersistedState() ).toBe( true );

		// Reader chat, or any host opting in via `persistStateLocally` (the
		// anonymous storefront): never touch the logged-in-only endpoint.
		mockUsesLocalStatePersistence.mockReturnValue( true );
		expect( shouldUsePersistedState() ).toBe( false );
	} );
} );
