/**
 * @jest-environment jsdom
 */

import { activeAgencyQuery, queryClient } from '@automattic/api-queries';
import { earnPayoutSettingsRoute } from '../agency';
import type { Agency } from '@automattic/api-core';

function runGuard() {
	const beforeLoad = earnPayoutSettingsRoute.options.beforeLoad as unknown as ( options: {
		cause: string;
	} ) => Promise< void >;

	return beforeLoad( { cause: 'enter' } );
}

function setApprovalStatus( approvalStatus: string ) {
	queryClient.setQueryData( activeAgencyQuery().queryKey, {
		id: 5,
		approval_status: approvalStatus,
	} as unknown as Agency );
}

describe( 'earnPayoutSettingsRoute', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	test.each( [ 'pending', 'rejected' ] )(
		'sends a %s agency to the Overview',
		async ( approvalStatus ) => {
			setApprovalStatus( approvalStatus );

			const redirect = await runGuard().catch( ( error ) => error );

			expect( redirect ).toMatchObject( { isRedirect: true, to: '/overview' } );
		}
	);

	test( 'lets an approved agency through', async () => {
		setApprovalStatus( 'approved' );

		await expect( runGuard() ).resolves.toBeUndefined();
	} );
} );
