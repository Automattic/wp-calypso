import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice, removeNotice } from 'calypso/state/notices/actions';
import type { UpdateError } from './use-vat-details';

export default function useDisplayVatNotices( {
	error,
	success,
	taxName,
}: {
	error: UpdateError | null;
	success: boolean;
	taxName: string | undefined;
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		if ( error ) {
			dispatch( removeNotice( 'vat_info_notice' ) );
			dispatch( errorNotice( error.message, { id: 'vat_info_notice' } ) );
			return;
		}

		if ( success ) {
			dispatch( removeNotice( 'vat_info_notice' ) );
			dispatch(
				successNotice(
					/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
					translate( 'Your %s details have been updated!', {
						textOnly: true,
						args: [ taxName ?? translate( 'VAT', { textOnly: true } ) ],
					} ),
					{
						id: 'vat_info_notice',
					}
				)
			);
			return;
		}
	}, [ error, success, dispatch, translate, taxName ] );
}
