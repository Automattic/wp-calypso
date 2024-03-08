import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC, useCallback, useMemo } from 'react';
import LicensingActivation from 'calypso/components/jetpack/licensing-activation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { addQueryArgs } from 'calypso/lib/url';
import { isJetpackStandaloneProduct } from 'calypso/my-sites/plans/jetpack-plans/is-jetpack-standalone-product';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import JetpackActivationInstructions from './jetpack-activation-instructions';
import { JetpackLicenseKeyProps } from './jetpack-license-key-clipboard';
import JetpackStandaloneActivationInstructions from './jetpack-standalone-activation-instructions';
import { getJetpackPluginImage } from './utils';

const LicensingActivationInstructions: FC< JetpackLicenseKeyProps > = ( {
	productSlug,
	receiptId,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const jetpackStandaloneProduct = useMemo(
		() =>
			isEnabled( 'jetpack/standalone-plugin-onboarding-update-v1' ) &&
			isJetpackStandaloneProduct( productSlug )
				? slugToSelectorProduct( productSlug )
				: null,
		[ productSlug ]
	);

	const jetpackPluginImage = getJetpackPluginImage( productSlug );

	const onContinue = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_siteless_checkout_manual_activation_instructions_click', {
				product_slug: productSlug,
			} )
		);
		return page(
			addQueryArgs(
				{
					receiptId,
				},
				`/checkout/jetpack/thank-you/licensing-manual-activate-license-key/${ productSlug }`
			)
		);
	}, [ dispatch, productSlug, receiptId ] );

	return (
		<>
			<PageViewTracker
				options={ { useJetpackGoogleAnalytics: true } }
				path="/checkout/jetpack/thank-you/licensing-manual-activation-instructions/:product"
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Thank You Licensing Manual Activation Instructions"
			/>
			<LicensingActivation
				title={
					jetpackStandaloneProduct
						? translate( `Ok, let's install Jetpack %(pluginName)s`, {
								args: { pluginName: jetpackStandaloneProduct?.shortName },
						  } )
						: translate( 'Be sure that you have the latest version of Jetpack' )
				}
				footerImage={ jetpackPluginImage }
				altLayout={ !! jetpackStandaloneProduct }
				showContactUs
				showProgressIndicator={ ! jetpackStandaloneProduct }
				progressIndicatorValue={ 2 }
				progressIndicatorTotal={ 3 }
			>
				{ jetpackStandaloneProduct ? (
					<JetpackStandaloneActivationInstructions
						product={ jetpackStandaloneProduct }
						receiptId={ receiptId }
					/>
				) : (
					<>
						<JetpackActivationInstructions />

						<Button
							className="licensing-thank-you-manual-activation-instructions__button"
							primary
							disabled={ false }
							onClick={ onContinue }
						>
							{ translate( 'Continue ' ) }
						</Button>
					</>
				) }
			</LicensingActivation>
		</>
	);
};

export default LicensingActivationInstructions;
