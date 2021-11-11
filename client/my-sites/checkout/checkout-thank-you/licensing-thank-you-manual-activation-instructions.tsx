import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import licensingActivationPluginInstall from 'calypso/assets/images/jetpack/licensing-activation-plugin-install.svg';
import ExternalLink from 'calypso/components/external-link';
import LicensingActivation from 'calypso/components/jetpack/licensing-activation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

interface Props {
	productSlug: string | 'no_product';
	receiptId: number;
}

const LicensingActivationInstructions: FC< Props > = ( { productSlug, receiptId } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

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
				path={ '/checkout/jetpack/thank-you/licensing-manual-activation-instructions/:product' }
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Thank You Licensing Manual Activation Instructions"
			/>
			<LicensingActivation
				title={ translate( 'Be sure that you have the latest version of Jetpack' ) }
				footerImage={ licensingActivationPluginInstall }
				showContactUs
				showProgressIndicator
				progressIndicatorValue={ 2 }
				progressIndicatorTotal={ 3 }
			>
				<p>{ translate( "If you don't have Jetpack installed, follow these instructions:" ) }</p>
				<p>
					<span className="licensing-thank-you-manual-activation-instructions__step-number">1</span>
					{ translate( 'Go to your WP Admin Dashboard and {{strong}}add a new plugin{{/strong}}.', {
						components: { strong: <strong /> },
					} ) }
				</p>
				<p>
					<span className="licensing-thank-you-manual-activation-instructions__step-number">2</span>
					{ translate( 'Search for {{strong}}Jetpack{{/strong}}, install and activate.', {
						components: { strong: <strong /> },
					} ) }
				</p>
				<p>
					<ExternalLink
						href={ 'https://jetpack.com/support/install-jetpack-and-connect-your-new-plan/' }
						icon
					>
						{ translate( 'Learn more about how to install Jetpack' ) }
					</ExternalLink>
				</p>
				<Button
					className="licensing-thank-you-manual-activation-instructions__button"
					primary
					disabled={ false }
					onClick={ onContinue }
				>
					{ translate( 'Continue ' ) }
				</Button>
			</LicensingActivation>
		</>
	);
};

export default LicensingActivationInstructions;
