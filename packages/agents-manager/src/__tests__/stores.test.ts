jest.mock( '@automattic/data-stores', () => ( {
	AgentsManager: {
		register: jest.fn( () => 'automattic/agents-manager' ),
		persistAgentsManagerState: jest.fn(),
	},
} ) );

jest.mock( '../utils/is-reader-chat-agent', () => ( {
	isReaderChatHost: jest.fn(),
} ) );

import { AgentsManager } from '@automattic/data-stores';
import { isReaderChatHost } from '../utils/is-reader-chat-agent';
import '../stores';

const mockRegister = AgentsManager.register as jest.MockedFunction< typeof AgentsManager.register >;
const mockIsReaderChatHost = isReaderChatHost as jest.MockedFunction< typeof isReaderChatHost >;

describe( 'Agents Manager store', () => {
	it( 'loads persisted state only for non-Reader Chat hosts', () => {
		const shouldLoadPersistedState = mockRegister.mock.calls[ 0 ]?.[ 0 ]?.shouldLoadPersistedState;
		if ( ! shouldLoadPersistedState ) {
			throw new Error( 'Expected the store to register a persisted-state callback.' );
		}

		mockIsReaderChatHost.mockReturnValue( false );
		expect( shouldLoadPersistedState() ).toBe( true );

		mockIsReaderChatHost.mockReturnValue( true );
		expect( shouldLoadPersistedState() ).toBe( false );
	} );
} );
