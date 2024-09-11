import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import licensingActivationPluginBanner from 'calypso/assets/images/jetpack/licensing-activation-plugin-banner.svg';
import QueryProductsList from 'calypso/components/data/query-products-list';
import LicensingActivation from 'calypso/components/jetpack/licensing-activation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useSelector } from 'calypso/state';
import {
	isProductsListFetching as getIsProductListFetching,
	getProductName,
} from 'calypso/state/products-list/selectors';
import JetpackLicenseKeyClipboard, {
	JetpackLicenseKeyProps,
} from './jetpack-license-key-clipboard';

const LicensingActivationInstructions: FC< JetpackLicenseKeyProps > = ( {
	productSlug,
	receiptId,
} ) => {
	const translate = useTranslate();

	const hasProductInfo = productSlug !== 'no_product';

	const productName = useSelector( ( state ) =>
		hasProductInfo ? getProductName( state, productSlug ) : null
	);

	const isProductListFetching = useSelector( getIsProductListFetching );

	return (
		<>
			<QueryProductsList type="jetpack" />
			<PageViewTracker
				options={ { useJetpackGoogleAnalytics: true } }
				path="/checkout/jetpack/thank-you/licensing-manual-activation-license-key/:product"
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Thank You Licensing Manual Activation License Key"
			/>
			<LicensingActivation
				title={ translate( 'Activate your %(productName)s plan', {
					args: { productName: productName ?? '' },
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
						'After installing the plugin, in WP-Admin, go to {{strong}}Jetpack > My Jetpack{{/strong}} and click the "Activate a license" link at the bottom of the page. Then use this license key to activate your product.',
						{
							components: {
								strong: <strong />,
							},
						}
					) }
				</p>

				<JetpackLicenseKeyClipboard productSlug={ productSlug } receiptId={ receiptId } />
			</LicensingActivation>
		</>
	);
};

export default LicensingActivationInstructions;
