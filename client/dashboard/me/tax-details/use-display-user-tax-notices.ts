import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import type { UpdateError } from './user-tax-form';

export default function useDisplayUserTaxNotices( {
	error,
	success,
	taxName,
}: {
	error: UpdateError | null;
	success: boolean;
	taxName: string | undefined;
} ) {
	const { createSuccessNotice, createErrorNotice, removeNotice } = useDispatch( noticesStore );

	useEffect( () => {
		if ( error ) {
			removeNotice( 'vat_info_notice' );
			createErrorNotice( error.message, { type: 'snackbar', id: 'vat_info_notice' } );
			return;
		}

		if ( success ) {
			removeNotice( 'vat_info_notice' );
			createSuccessNotice(
				sprintf(
					/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
					__( 'Your %s details have been updated!' ),
					taxName ?? __( 'VAT' )
				),
				{
					id: 'vat_info_notice',
				}
			);
			return;
		}
	}, [ createSuccessNotice, createErrorNotice, removeNotice, error, success, taxName ] );
}
