import { Card } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import QueryProducts from 'calypso/components/data/query-products-list';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { isProductsListFetching, getProductName } from 'calypso/state/products-list/selectors';
import type { FunctionComponent } from 'react';

interface AkismetCheckoutThankYouProps {
	productSlug: string | 'no_product';
}

const AkismetCheckoutThankYou: FunctionComponent< AkismetCheckoutThankYouProps > = ( {
	productSlug,
} ) => {
	const hasProduct = productSlug !== 'no_product';
	const productName = useSelector( ( state ) =>
		hasProduct ? getProductName( state, productSlug ) : null
	);
	const isLoading = useSelector( isProductsListFetching );

	return (
		<Main className="akismet-checkout-thank-you">
			<PageViewTracker
				options={ { useAkismetGoogleAnalytics: true } }
				path="/checkout/akismet/thank-you/:productSlug"
				properties={ { product_slug: productSlug } }
				title="Checkout > Akismet Thank You"
			/>

			<Card className="akismet-checkout-thank-you__card">
				{ /* An improvment here would be to add a type filter on wpcom like jetpack has. See: 2f832-pb/ */ }
				{ hasProduct && <QueryProducts /> }

				<h2 className="akismet-checkout-thank-you__main-message">
					{ /* the single space literal below is intentional for rendering purposes */ }
					{ __( 'Let the spam-blocking party begin!', 'akismet-thank-you' ) }{ ' ' }
					<span className="akismet-checkout-thank-you__emoji">
						{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
					</span>
				</h2>

				<p
					className={
						isLoading
							? 'akismet-checkout-thank-you__email-message-loading'
							: 'akismet-checkout-thank-you__email-message'
					}
				>
					{ createInterpolateElement(
						sprintf(
							// translators: %s is the product name
							__(
								'Thanks for your purchase. We have sent you an email with your receipt and further instructions on how to activate <strong>%s</strong>.',
								'akismet-thank-you'
							),
							productName
						),
						{ strong: <strong /> }
					) }
				</p>
			</Card>

			<div className="akismet-checkout-thank-you__footer-img"></div>
		</Main>
	);
};

export default AkismetCheckoutThankYou;
