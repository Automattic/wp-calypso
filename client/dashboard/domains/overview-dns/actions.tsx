import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { edit, trash } from '@wordpress/icons';
import { useMemo } from 'react';
import type { DnsRecord } from '../../data/domain-dns-records';
import type { Action } from '@wordpress/dataviews';

export function useDnsActions(): Action< DnsRecord >[] {
	return useMemo(
		() => [
			{
				isEligible: ( item: DnsRecord ) => ! item.protected_field,
				id: 'edit',
				label: __( 'Edit' ),
				icon: <Icon icon={ edit } />,
				isPrimary: true,
				callback: ( items: DnsRecord[] ) => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const item = items[ 0 ];
					// TODO: Implement edit functionality
				},
			},
			{
				isEligible: ( item: DnsRecord ) => {
					return ! ( item.protected_field && 'MX' !== item.type ) || item.type === 'A';
				},
				id: 'delete',
				label: __( 'Delete' ),
				icon: <Icon icon={ trash } />,
				callback: ( items: DnsRecord[] ) => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const item = items[ 0 ];
					// TODO: Implement delete functionality
				},
			},
		],
		[]
	);
}
