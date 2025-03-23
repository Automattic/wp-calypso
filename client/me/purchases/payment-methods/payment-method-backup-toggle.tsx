import { useLocalizeUrl } from '@automattic/i18n-utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckboxControl, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import wpcom from 'calypso/lib/wp';
import { storedPaymentMethodsQueryKey } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import type { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';

async function fetchIsBackup( storedDetailsId: string ): Promise< { is_backup: boolean } > {
	return await wpcom.req.get( `/me/payment-methods/${ storedDetailsId }/is-backup` );
}

async function setIsBackup(
	storedDetailsId: string,
	isBackup: boolean
): Promise< { is_backup: boolean } > {
	return await wpcom.req.post( {
		path: `/me/payment-methods/${ storedDetailsId }/is-backup`,
		body: { is_backup: isBackup },
	} );
}

export default function PaymentMethodBackupToggle( { card }: { card: StoredPaymentMethod } ) {
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	const storedDetailsId = card.stored_details_id;
	const initialIsBackup = !! card.is_backup;
	const queryClient = useQueryClient();
	const { isLoading, isError, data } = useQuery< { is_backup: boolean }, Error >( {
		queryKey: [ 'payment-method-backup-toggle', storedDetailsId ],
		queryFn: () => fetchIsBackup( storedDetailsId ),
		initialData: { is_backup: initialIsBackup },
	} );
	const mutation = useMutation( {
		mutationFn: ( isBackup: boolean ) => setIsBackup( storedDetailsId, isBackup ),
		onMutate: ( isBackup ) => {
			// Optimistically update the toggle
			queryClient.setQueryData( [ 'payment-method-backup-toggle', storedDetailsId ], {
				is_backup: isBackup,
			} );
		},
		onSuccess: ( data ) => {
			queryClient.setQueryData( [ 'payment-method-backup-toggle', storedDetailsId ], data );

			// Invalidate queries made by `useStoredPaymentMethods`.
			queryClient.invalidateQueries( {
				queryKey: [ storedPaymentMethodsQueryKey ],
			} );
		},
	} );
	const toggleIsBackup = useCallback(
		( isChecked: boolean ) => {
			mutation.mutate( isChecked );
		},
		[ mutation ]
	);
	if ( isLoading ) {
		return (
			<div className="payment-method-backup-toggle">
				<Spinner />
			</div>
		);
	}
	if ( isError ) {
		return (
			<div className="payment-method-backup-toggle">
				{ translate( 'Error fetching backup status' ) }
			</div>
		);
	}
	const isBackup = data?.is_backup ?? false;
	return (
		<div className="payment-method-backup-toggle">
			<CheckboxControl
				checked={ isBackup }
				onChange={ toggleIsBackup }
				label={
					translate( 'Use as backup{{supportLink /}}', {
						components: {
							supportLink: (
								<InlineSupportLink
									showText={ false }
									supportContext="backup_payment_methods"
									iconSize={ 16 }
									supportLink={
										isJetpackCloud()
											? localizeUrl(
													'https://wordpress.com/support/payment/#backup-payment-methods'
											  )
											: null
									}
								/>
							),
						},
					} ) as string
				}
			/>
		</div>
	);
}
