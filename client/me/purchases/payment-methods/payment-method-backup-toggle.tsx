import { CheckboxControl, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import wpcom from 'calypso/lib/wp';
import { updateStoredCardIsBackupComplete } from 'calypso/state/stored-cards/actions';
import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';

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

export default function PaymentMethodBackupToggle( { card }: { card: StoredCard } ): JSX.Element {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const storedDetailsId = card.stored_details_id;
	const initialIsBackup =
		card.meta?.find( ( meta ) => meta.meta_key === 'is_backup' )?.meta_value === 'yes';
	const queryClient = useQueryClient();
	const { isLoading, isError, data } = useQuery< { is_backup: boolean }, Error >(
		[ 'payment-method-backup-toggle', storedDetailsId ],
		() => fetchIsBackup( storedDetailsId ),
		{
			initialData: { is_backup: initialIsBackup },
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		}
	);
	const mutation = useMutation( ( isBackup: boolean ) => setIsBackup( storedDetailsId, isBackup ), {
		onMutate: ( isBackup ) => {
			// Optimistically update the toggle
			queryClient.setQueryData( [ 'payment-method-backup-toggle', storedDetailsId ], {
				is_backup: isBackup,
			} );
		},
		onSuccess: ( data ) => {
			queryClient.setQueryData( [ 'payment-method-backup-toggle', storedDetailsId ], data );
			// Update the data in the stored cards Redux store to match the changes made here
			reduxDispatch( updateStoredCardIsBackupComplete( storedDetailsId, data.is_backup ) );
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
	// TODO: add real "Learn more" link because "backup" is not obvious
	return (
		<div className="payment-method-backup-toggle">
			<CheckboxControl
				checked={ isBackup }
				onChange={ toggleIsBackup }
				label={ translate( 'Use as backup. {{link}}Learn more{{/link}}', {
					components: {
						link: <ExternalLink icon href="https://wordpress.com/support/manage-purchases/" />,
					},
				} ) }
			/>
		</div>
	);
}
