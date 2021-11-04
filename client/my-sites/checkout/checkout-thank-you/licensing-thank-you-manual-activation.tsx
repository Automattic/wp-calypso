import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import footerCardImg from 'calypso/assets/images/jetpack/licensing-card.png';
import LicensingActivation from 'calypso/components/jetpack/licensing-activation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

interface Props {
	productSlug: string | 'no_product';
}

const LicensingActivationThankYou: FC< Props > = ( { productSlug } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onContinue = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_siteless_checkout_manual_activation_click', {
				product_slug: productSlug,
			} )
		);
		return page(
			`/checkout/jetpack/thank-you/licensing-manual-activate-instructions/${ productSlug }`
		);
	}, [ dispatch, productSlug ] );

	return (
		<>
			<PageViewTracker
				options={ { useJetpackGoogleAnalytics: true } }
				path={ '/checkout/jetpack/thank-you/licensing-manual-activation/:product' }
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Thank You Licensing Manual Activation"
			/>
			<LicensingActivation
				title={
					<>
						{ translate( 'Thank you for your purchase!' ) }{ ' ' }
						{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
					</>
				}
				footerImage={ footerCardImg }
				showProgressIndicator
				progressIndicatorValue={ 1 }
				progressIndicatorTotal={ 3 }
			>
				<p>
					{ translate( 'Learn how to get started with Jetpack.' ) }
					<br />
					{ translate( "We've also sent you an email with these instructions." ) }
				</p>
				<Button primary disabled={ false } onClick={ onContinue }>
					{ translate( 'Continue' ) }
				</Button>
			</LicensingActivation>
		</>
	);
};

export default LicensingActivationThankYou;
