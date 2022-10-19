import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { FC, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import licensingActivationPluginInstall from 'calypso/assets/images/jetpack/licensing-activation-plugin-install.svg';
import ExternalLink from 'calypso/components/external-link';
import LicensingActivation from 'calypso/components/jetpack/licensing-activation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { addQueryArgs } from 'calypso/lib/url';
import hasStandalonePlugin from 'calypso/my-sites/plans/jetpack-plans/has-standalone-plugin';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

interface Props {
	productSlug: string | 'no_product';
	receiptId: number;
}

interface JetpackStandaloneActivationInstructionsProps {
	product: SelectorProduct;
}

const JetpackPluginActivationInstructions: FC = () => {
	const translate = useTranslate();

	return (
		<>
			<p>{ translate( "If you don't have Jetpack installed, follow these instructions:" ) }</p>

			<ul className="licensing-thank-you-manual-activation-instructions__list">
				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					<span className="licensing-thank-you-manual-activation-instructions__step-number">1</span>
					<span>
						{ ' ' }
						{ translate(
							'Go to your WP Admin Dashboard and {{strong}}add a new plugin{{/strong}}.',
							{
								components: { strong: <strong /> },
							}
						) }
					</span>
				</li>

				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					<span className="licensing-thank-you-manual-activation-instructions__step-number">2</span>
					<span>
						{ translate( 'Search for {{strong}}Jetpack{{/strong}}, install and activate.', {
							components: { strong: <strong /> },
						} ) }
					</span>
				</li>
			</ul>

			<p>
				<ExternalLink
					href="https://jetpack.com/support/install-jetpack-and-connect-your-new-plan/"
					icon
				>
					{ translate( 'Learn more about how to install Jetpack' ) }
				</ExternalLink>
			</p>
		</>
	);
};

const JetpackStandaloneActivationInstructions: FC<
	JetpackStandaloneActivationInstructionsProps
> = ( { product } ) => {
	const translate = useTranslate();
	return (
		<>
			<ul className="licensing-thank-you-manual-activation-instructions__list">
				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					<span className="licensing-thank-you-manual-activation-instructions__step-number">1</span>
					<span>{ translate( 'Login to an existing Wordpress site as an administrator.' ) }</span>
				</li>

				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					<span className="licensing-thank-you-manual-activation-instructions__step-number">2</span>
					<span>
						{ translate(
							'Go to {{strong}}Plugins > add New{{/strong}} in the admin menu on the left hand side.',
							{
								components: { strong: <strong /> },
							}
						) }
					</span>
				</li>

				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					<span className="licensing-thank-you-manual-activation-instructions__step-number">3</span>
					<span>
						{ translate(
							'Search for {{strong}}Jetpack %(pluginName)s{{/strong}}, install and activate.',
							{
								components: { strong: <strong /> },
								args: { pluginName: product.shortName },
							}
						) }
					</span>
				</li>
			</ul>

			<p>
				<ExternalLink
					href="https://jetpack.com/support/install-jetpack-and-connect-your-new-plan/"
					icon
				>
					{ translate( 'Learn more about how to install Jetpack %(pluginName)s', {
						args: { pluginName: product.shortName },
					} ) }
				</ExternalLink>
			</p>
		</>
	);
};

const LicensingActivationInstructions: FC< Props > = ( { productSlug, receiptId } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const productWithStandalonePlugin = useMemo(
		() =>
			isEnabled( 'jetpack/standalone-plugin-onboarding-update-v1' ) &&
			hasStandalonePlugin( productSlug )
				? slugToSelectorProduct( productSlug )
				: null,
		[ productSlug ]
	);

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
					productWithStandalonePlugin
						? translate( `Ok, let's install Jetpack %(pluginName)s`, {
								args: { pluginName: productWithStandalonePlugin?.shortName },
						  } )
						: translate( 'Be sure that you have the latest version of Jetpack' )
				}
				footerImage={ licensingActivationPluginInstall }
				showContactUs
				showProgressIndicator
				progressIndicatorValue={ 2 }
				progressIndicatorTotal={ 3 }
			>
				{ productWithStandalonePlugin ? (
					<JetpackStandaloneActivationInstructions product={ productWithStandalonePlugin } />
				) : (
					<JetpackPluginActivationInstructions />
				) }

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
