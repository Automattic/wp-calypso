import { vi } from 'vitest';
import {
	createTitanMailboxMutation,
	deleteTitanMailboxMutation,
	mailboxAccountsQuery,
} from '../emails';
import { userMailboxesQuery } from '../me-mailboxes';
import { queryClient } from '../query-client';
import type { EmailAccount, EmailBox } from '@automattic/api-core';

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

	it( 'marks the deleted mailbox as pending deletion, then refetches the mailboxes', async () => {
		vi.useFakeTimers();
		const { queryKey } = userMailboxesQuery();
		const box = { mailbox: 'hello', domain: DOMAIN, warnings: [] } as unknown as EmailBox;
		const otherBox = { ...box, mailbox: 'other' };
		queryClient.setQueryData( queryKey, [
			{ emails: [ box, otherBox ] } as unknown as EmailAccount,
		] );

		await queryClient
			.getMutationCache()
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.build( queryClient, deleteTitanMailboxMutation() as any )
			.execute( VARIABLES );

		expect( queryClient.getQueryData( queryKey )?.[ 0 ].emails ).toEqual( [
			{ ...box, status: 'pending_deletion' },
			otherBox,
		] );
		expect( queryClient.getQueryState( queryKey )?.isInvalidated ).toBe( false );

		vi.advanceTimersByTime( 5000 );

		expect( queryClient.getQueryState( queryKey )?.isInvalidated ).toBe( true );
		vi.useRealTimers();
	} );
} );
