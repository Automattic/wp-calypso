import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import licensingActivationPluginBanner from 'calypso/assets/images/jetpack/licensing-activation-plugin-banner.svg';
import QueryProductsList from 'calypso/components/data/query-products-list';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import LicensingActivation from 'calypso/components/jetpack/licensing-activation';
import useUserLicenseByReceiptQuery from 'calypso/data/jetpack-licensing/use-user-license-by-receipt-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	isProductsListFetching as getIsProductListFetching,
	getProductName,
} from 'calypso/state/products-list/selectors';

interface Props {
	productSlug: string | 'no_product';
	receiptId: number;
}

const LicensingActivationInstructions: FC< Props > = ( { productSlug, receiptId } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isCopied, setCopied ] = useState( false );

	const hasProductInfo = productSlug !== 'no_product';

	const productName = useSelector( ( state ) =>
		hasProductInfo ? getProductName( state, productSlug ) : null
	);

	const isProductListFetching = useSelector( ( state ) => getIsProductListFetching( state ) );

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
		if ( isCopied ) {
			const confirmationTimeout = setTimeout( () => setCopied( false ), 4000 );
			return () => clearTimeout( confirmationTimeout );
		}
	}, [ isCopied ] );

	return (
		<>
			<QueryProductsList type="jetpack" />
			<PageViewTracker
				options={ { useJetpackGoogleAnalytics: true } }
				path={ '/checkout/jetpack/thank-you/licensing-manual-activation-license-key/:product' }
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Thank You Licensing Manual Activation License Key"
			/>
			<LicensingActivation
				title={ translate( 'Activate your %(productName)s', {
					args: { productName },
				} ) }
				footerImage={ licensingActivationPluginBanner }
				isLoading={ isProductListFetching }
				showContactUs
				showProgressIndicator
				progressIndicatorValue={ 3 }
				progressIndicatorTotal={ 3 }
			>
				<p>
					{ translate(
						'Use your license key to activate your product after installing Jetpack. You can also find the activation link on your {{strong}}WP Admin Jetpack Dashboard > My Plan{{/strong}} page.',
						{
							components: {
								strong: <strong />,
							},
						}
					) }
				</p>
				<div className="licensing-thank-you-manual-activation-license-key__key">
					<label>
						<strong>{ translate( 'Your license key' ) }</strong>
					</label>
					<div className={ 'licensing-thank-you-manual-activation-license-key__clipboard' }>
						<FormTextInput
							className={ classnames( 'licensing-thank-you-manual-activation-license-key__input', {
								'is-loading': isLoadingLicense,
							} ) }
							value={ licenseKey }
							readOnly
						/>
						<ClipboardButton
							className="licensing-thank-you-manual-activation-license-key__button"
							text={ licenseKey }
							onCopy={ onCopy }
							compact
							primary
							disabled={ isErrorFetchingLicense || isLoadingLicense }
						>
							{ isCopied ? translate( 'Copied!' ) : translate( 'Copy', { context: 'verb' } ) }
						</ClipboardButton>
					</div>
				</div>
			</LicensingActivation>
		</>
	);
};

export default LicensingActivationInstructions;
