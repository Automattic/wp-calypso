import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback, useEffect, useState } from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import useUserLicenseByReceiptQuery from 'calypso/data/jetpack-licensing/use-user-license-by-receipt-query';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export interface JetpackLicenseKeyProps {
	productSlug: string | 'no_product';
	receiptId: number;
}

const JetpackLicenseKeyClipboard: React.FC< JetpackLicenseKeyProps > = ( {
	productSlug,
	receiptId,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ copied, setCopied ] = useState( false );

	const {
		data: dataLicense,
		isError: isErrorFetchingLicense,
		isLoading: isLoadingLicense,
	} = useUserLicenseByReceiptQuery( receiptId );

	const licenseKey =
		! isErrorFetchingLicense && ! isLoadingLicense && dataLicense
			? dataLicense[ 0 ].licenseKey
			: '';

	const onCopy = useCallback( () => {
		setCopied( true );
		dispatch(
			recordTracksEvent( 'calypso_siteless_checkout_manual_activation_license_key_copy', {
				product_slug: productSlug,
				license_key: licenseKey,
			} )
		);
	}, [ dispatch, licenseKey, productSlug ] );

	useEffect( () => {
		if ( copied ) {
			const confirmationTimeout = setTimeout( () => setCopied( false ), 4000 );
			return () => clearTimeout( confirmationTimeout );
		}
	}, [ copied ] );

	return (
		<>
			<div className="jetpack-license-key-clipboard">
				<label>
					<strong>{ translate( 'Your license key' ) }</strong>
				</label>
				<div className="jetpack-license-key-clipboard__container">
					<FormTextInput
						className={ clsx( 'jetpack-license-key-clipboard__input', {
							'is-loading': isLoadingLicense,
						} ) }
						value={ licenseKey }
						readOnly
					/>
					<ClipboardButton
						className="jetpack-license-key-clipboard__button"
						text={ licenseKey }
						onCopy={ onCopy }
						compact
						primary
						disabled={ isErrorFetchingLicense || isLoadingLicense }
					>
						{ copied ? translate( 'Copied!' ) : translate( 'Copy', { context: 'verb' } ) }
					</ClipboardButton>
				</div>
				<div className="jetpack-license-key-clipboard__helper-text">
					{ translate( 'We sent the license key to your email inbox too.' ) }
				</div>
			</div>
		</>
	);
};

export default JetpackLicenseKeyClipboard;
