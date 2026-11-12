/* eslint-disable import/order */
import { type MockedFunction, vi } from 'vitest';
vi.mock( '@automattic/data-stores', () => ( {
	AgentsManager: {
		register: vi.fn( () => 'automattic/agents-manager' ),
	},
} ) );

vi.mock( '../utils/is-reader-chat-agent', () => ( {
	isReaderChatHost: vi.fn(),
} ) );

import { AgentsManager } from '@automattic/data-stores';
import { isReaderChatHost } from '../utils/is-reader-chat-agent';

const mockRegister = AgentsManager.register as MockedFunction< typeof AgentsManager.register >;
const mockIsReaderChatHost = isReaderChatHost as MockedFunction< typeof isReaderChatHost >;

describe( 'Agents Manager store', () => {
	it( 'uses persisted state only for non-Reader Chat hosts', async () => {
		// The store registers on import; Vitest clears mock calls before each test.
		await import( '../stores' );

		const shouldUsePersistedState = mockRegister.mock.calls[ 0 ]?.[ 0 ]?.shouldUsePersistedState;
		if ( ! shouldUsePersistedState ) {
			throw new Error( 'Expected the store to register a persisted-state callback.' );
		}

		mockIsReaderChatHost.mockReturnValue( false );
		expect( shouldUsePersistedState() ).toBe( true );

		mockIsReaderChatHost.mockReturnValue( true );
		expect( shouldUsePersistedState() ).toBe( false );
	} );
} );
