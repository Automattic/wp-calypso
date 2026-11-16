/**
 * @vitest-environment jsdom
 */
import { DomainSubtype, DomainTransferStatus } from '@automattic/api-core';
import { domainQuery, queryClient } from '@automattic/api-queries';
import { domainTransferIndexRoute } from '../domains';

test.each( [ DomainTransferStatus.PENDING_START, DomainTransferStatus.COMPLETED ] )(
	'the transfer page keeps `back_to` when redirecting a %s transfer',
	async ( transfer_status ) => {
		queryClient.setQueryData( domainQuery( 'example.com' ).queryKey, {
			domain: 'example.com',
			subtype: { id: DomainSubtype.DOMAIN_TRANSFER },
			transfer_status,
		} as never );
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const loader = domainTransferIndexRoute.options.loader as any;

		const redirect = await loader( {
			params: { domainName: 'example.com' },
			location: { search: { back_to: 'site-domains' } },
		} ).catch( ( error: unknown ) => error );

		expect( redirect ).toMatchObject( { options: { search: { back_to: 'site-domains' } } } );
	}
);
