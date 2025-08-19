import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { edit, trash } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo } from 'react';
import { domainDnsMutation } from '../../app/queries/domain-dns-records';
import { domainRoute, domainDnsEditRoute } from '../../app/router/domains';
import type { DnsRecord } from '../../data/domain-dns-records';
import type { Action } from '@wordpress/dataviews';

export function useDnsActions(): Action< DnsRecord >[] {
	const { domainName } = domainRoute.useParams();
	const deleteMutation = useMutation( domainDnsMutation( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const router = useRouter();

	return useMemo( () => {
		const handleDelete = async ( items: DnsRecord[] ) => {
			const itemToDelete = items[ 0 ];
			if ( ! itemToDelete ) {
				return;
			}

			deleteMutation.mutate(
				{
					recordsToAdd: [],
					recordsToRemove: [ itemToDelete ],
					restoreDefaultARecords: false,
				},
				{
					onSuccess: () => {
						createSuccessNotice( __( 'DNS record deleted.' ), { type: 'snackbar' } );
					},
					onError: () => {
						createErrorNotice( __( 'Failed to delete DNS record.' ), {
							type: 'snackbar',
						} );
					},
				}
			);
		};

		return [
			{
				isEligible: ( item: DnsRecord ) => ! item.protected_field,
				id: 'edit',
				label: __( 'Edit' ),
				icon: <Icon icon={ edit } />,
				isPrimary: true,
				callback: ( items: DnsRecord[] ) => {
					const item = items[ 0 ];
					router.navigate( {
						to: domainDnsEditRoute.fullPath,
						params: { domainName },
						search: {
							recordId: item.id,
						},
					} );
				},
			},
			{
				isEligible: ( item: DnsRecord ) => {
					return ! ( item.protected_field && 'MX' !== item.type ) || item.type === 'A';
				},
				id: 'delete',
				isBusy: deleteMutation.isPending,
				label: __( 'Delete' ),
				icon: <Icon icon={ trash } />,
				callback: handleDelete,
			},
		];
	}, [ deleteMutation, createSuccessNotice, createErrorNotice, router, domainName ] );
}
