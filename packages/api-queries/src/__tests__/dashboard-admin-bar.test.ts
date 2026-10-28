import { dashboardAdminBarQuery } from '../dashboard-admin-bar';
import type { AdminBarResponse } from '@automattic/api-core';

const adminBarWith = ( ...ids: string[] ): AdminBarResponse => ( {
	nodes: ids.map( ( id ) => ( { id, title: false, parent: false, href: '', group: false } ) ),
} );

const persists = ( data: AdminBarResponse ) =>
	( dashboardAdminBarQuery().meta?.persist as ( data: unknown ) => boolean )( data );

describe( 'dashboardAdminBarQuery', () => {
	it( 'persists the admin bar, but not one with the proxy-only AI chat node', () => {
		expect( persists( adminBarWith( 'help-center' ) ) ).toBe( true );
		expect( persists( adminBarWith( 'help-center', 'agents-manager-ai-chat' ) ) ).toBe( false );
	} );
} );
