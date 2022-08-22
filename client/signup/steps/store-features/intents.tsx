import { localizeUrl } from '@automattic/i18n-utils';
import { SelectItem } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import paymentBlocksImage from 'calypso/assets/images/onboarding/payment-blocks.svg';
import wooCommerceImage from 'calypso/assets/images/onboarding/woo-commerce.svg';
import { shoppingBag, truck } from '../../icons';
import { StoreFeatureSet } from './types';

export function useIntents(
	siteSlug: string | null,
	hasPaymentsFeature: boolean | false,
	hasWooFeature: boolean | false,
	trackSupportLinkClick: ( url: StoreFeatureSet ) => void
): SelectItem< StoreFeatureSet >[] {
	const translate = useTranslate();
	if ( ! siteSlug ) {
		return [];
	}

	return [
		{
			key: 'simple',
			title: translate( 'Start simple' ),
			description: (
				<>
					<span className="store-features__requirements">
						{ hasPaymentsFeature
							? translate( 'Included in your plan' )
							: translate( 'Requires a {{a}}paid plan{{/a}}', {
									components: {
										a: (
											<a
												href={ `/plans/${ siteSlug }` }
												target="_blank"
												rel="noopener noreferrer"
											/>
										),
									},
							  } ) }
					</span>

					<p>
						{ translate(
							'Ideal if you’re looking to accept donations or sell one or two products without needing to manage shipping.'
						) }
					</p>

					<footer className="store-features__powered-by">
						<img
							src={ paymentBlocksImage }
							alt="Payment Blocks"
							className="store-features__feature-icon"
						/>

						{ translate( 'Powered by {{a}}Payment Blocks{{/a}}', {
							components: {
								a: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/wordpress-editor/blocks/payments/'
										) }
										target="_blank"
										rel="noopener noreferrer"
										onClick={ () => trackSupportLinkClick( 'simple' ) }
									/>
								),
							},
						} ) }
					</footer>
				</>
			),
			icon: shoppingBag,
			value: 'simple',
			actionText: translate( 'Continue' ),
		},
		{
			key: 'power',
			title: translate( 'More power' ),
			description: (
				<>
					<span className="store-features__requirements">
						{ hasWooFeature
							? translate( 'Included in your plan' )
							: translate( 'Requires a {{a}}Business plan{{/a}}', {
									components: {
										a: (
											<a
												href={ `/plans/${ siteSlug }` }
												target="_blank"
												rel="noopener noreferrer"
											/>
										),
									},
							  } ) }
					</span>

					<p>
						{ translate(
							'If you have multiple products or require extensive order and shipping management then this might suit your needs better.'
						) }
					</p>

					<footer className="store-features__powered-by">
						<img
							src={ wooCommerceImage }
							alt="WooCommerce"
							className="store-features__feature-icon"
						/>

						{ translate( 'Powered by {{a}}WooCommerce{{/a}}', {
							components: {
								a: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/introduction-to-woocommerce/'
										) }
										target="_blank"
										rel="noopener noreferrer"
										onClick={ () => trackSupportLinkClick( 'power' ) }
									/>
								),
							},
						} ) }
					</footer>
				</>
			),
			icon: truck,
			value: 'power',
			actionText: hasWooFeature ? translate( 'Continue' ) : translate( 'Upgrade' ),
		},
	] as SelectItem< StoreFeatureSet >[];
}
