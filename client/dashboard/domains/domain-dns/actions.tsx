import { domainDnsMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Icon,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { pencil as edit, trash } from '@wordpress/icons';
import { useMemo } from 'react';
import { domainRoute, domainDnsEditRoute } from '../../app/router/domains';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import type { DnsRecord } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

export function useDnsActions(): Action< DnsRecord >[] {
	const { domainName } = domainRoute.useParams();
	const { mutate: deleteDnsRecord, isPending: isDeletingDnsRecord } = useMutation(
		withSnackbar( domainDnsMutation( domainName ), {
			success: __( 'DNS record deleted.' ),
			error: __( 'Failed to delete DNS record.' ),
		} )
	);
	const router = useRouter();

	return useMemo( () => {
		const handleDelete = async ( items: DnsRecord[] ) => {
			const itemToDelete = items[ 0 ];
			if ( ! itemToDelete ) {
				return;
			}

			deleteDnsRecord( {
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
				isBusy: isDeletingDnsRecord,
				label: __( 'Delete' ),
				icon: <Icon icon={ trash } />,
				isDestructive: true,
				RenderModal: ( { items, closeModal } ) => (
					<VStack spacing={ 4 }>
						<Text>
							{ sprintf(
								/* translators: %1$s is the DNS record type, for example CNAME; %2$s is the record name, for example www */
								__( 'The %1$s record for %2$s will be removed. This cannot be undone.' ),
								items[ 0 ].type,
								items[ 0 ].name.replace( /\.$/, '' ) === domainName ? '@' : items[ 0 ].name
							) }
						</Text>
						<ButtonStack justify="flex-end">
							<Button variant="tertiary" onClick={ () => closeModal?.() } __next40pxDefaultSize>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								variant="primary"
								isDestructive
								onClick={ () => {
									handleDelete( items );
									closeModal?.();
								} }
								__next40pxDefaultSize
							>
								{ __( 'Delete record' ) }
							</Button>
						</ButtonStack>
					</VStack>
				),
			},
		];
	}, [ deleteDnsRecord, isDeletingDnsRecord, router, domainName ] );
}
