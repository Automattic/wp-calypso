import { domainDnsMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { edit, trash } from '@wordpress/icons';
import { useMemo } from 'react';
import { domainRoute, domainDnsEditRoute } from '../../app/router/domains';
import type { DnsRecord } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

export function useDnsActions(): Action< DnsRecord >[] {
	const { domainName } = domainRoute.useParams();
	const deleteMutation = useMutation( {
		...domainDnsMutation( domainName ),
		meta: {
			snackbar: {
				success: __( 'DNS record deleted.' ),
				error: __( 'Failed to delete DNS record.' ),
			},
		},
	} );
	const router = useRouter();

	return useMemo( () => {
		const handleDelete = async ( items: DnsRecord[] ) => {
			const itemToDelete = items[ 0 ];
			if ( ! itemToDelete ) {
				return;
			}

			deleteMutation.mutate( {
				recordsToAdd: [],
				recordsToRemove: [ itemToDelete ],
				restoreDefaultARecords: false,
			} );
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
	}, [ deleteMutation, router, domainName ] );
}
