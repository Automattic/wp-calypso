import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import type { UpdateError } from './use-user-tax-details';

export default function useDisplayUserTaxNotices( {
	error,
	success,
	taxName,
}: {
	error: UpdateError | null;
	success: boolean;
	taxName: string | undefined;
} ) {
	const translate = useTranslate();
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
				/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
				translate( 'Your %s details have been updated!', {
					textOnly: true,
					args: [ taxName ?? translate( 'VAT', { textOnly: true } ) ],
				} ),
				{
					id: 'vat_info_notice',
				}
			);
			return;
		}
	}, [ createSuccessNotice, createErrorNotice, removeNotice, error, success, translate, taxName ] );
}
