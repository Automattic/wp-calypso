import { vi } from 'vitest';
import {
	createTitanMailboxMutation,
	deleteTitanMailboxMutation,
	mailboxAccountsQuery,
} from '../emails';
import { queryClient } from '../query-client';

vi.mock( '@automattic/api-core', async ( importOriginal ) => ( {
	...( await importOriginal< typeof import( '@automattic/api-core' ) >() ),
	createTitanMailbox: vi.fn().mockResolvedValue( undefined ),
	deleteTitanMailbox: vi.fn().mockResolvedValue( undefined ),
} ) );

const DOMAIN = 'example.com';
const VARIABLES = {
	domainName: DOMAIN,
	isAdmin: false,
	mailbox: 'hello',
	name: '',
	password: 'test-password',
	passwordResetEmail: 'reset@example.org',
};

describe( 'Titan mailbox mutations', () => {
	beforeEach( () => queryClient.clear() );

	it.each( [
		[ 'creating', createTitanMailboxMutation ],
		[ 'deleting', deleteTitanMailboxMutation ],
	] )( 'marks the domain accounts as stale after %s a mailbox', async ( _action, mutation ) => {
		const { queryKey } = mailboxAccountsQuery( 123, DOMAIN );
		queryClient.setQueryData( queryKey, [] );

		await queryClient
			.getMutationCache()
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.build( queryClient, mutation() as any )
			.execute( VARIABLES );

		expect( queryClient.getQueryState( queryKey )?.isInvalidated ).toBe( true );
	} );
} );
