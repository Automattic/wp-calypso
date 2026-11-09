import { productsQuery, siteBySlugQuery } from '@automattic/api-queries';
import { Button, Card } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import type { FunctionComponent } from 'react';

interface Props {
	site: string;
	productSlug: string | 'no_product';
	isUserlessCheckoutFlow: boolean;
}

const JetpackCheckoutThankYou: FunctionComponent< Props > = ( {
	site,
	productSlug,
	isUserlessCheckoutFlow = false,
} ) => {
	const translate = useTranslate();

	const hasProductInfo = productSlug !== 'no_product';

	const productsRequest = useQuery( { ...productsQuery( 'jetpack' ), enabled: hasProductInfo } );
	const productName = hasProductInfo ? productsRequest.data?.[ productSlug ]?.product_name : null;

	const siteRequest = useQuery( siteBySlugQuery( site ) );
	const siteName = siteRequest.data?.name;
	const siteUrl = siteRequest.data?.URL;
	const isLoading = siteRequest.isLoading || productsRequest.isLoading;

	return (
		<Main className="jetpack-checkout-thank-you">
			<PageViewTracker
				options={ { useJetpackGoogleAnalytics: true } }
				path="/checkout/jetpack/thank-you/:site/:product"
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Thank You"
			/>
			<Card className="jetpack-checkout-thank-you__card">
				<JetpackLogo full size={ 45 } />
				<h2 className="jetpack-checkout-thank-you__main-message">
					{ /* the single space literal below is intentional for rendering purposes */ }
					{ translate( 'Thank you for your purchase!' ) }{ ' ' }
					{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
				</h2>
				{ hasProductInfo && ( isLoading || ( siteName && productName ) ) && (
					<p
						className={
							isLoading
								? 'jetpack-checkout-thank-you__sub-message-loading'
								: 'jetpack-checkout-thank-you__sub-message'
						}
					>
						{ translate( '%(productName)s was added to your site %(siteName)s.', {
							args: {
								productName: productName as string, // We know this exists via hasProductInfo
								siteName: siteName ?? '',
							},
						} ) }
					</p>
				) }

				{ isUserlessCheckoutFlow && (
					<p
						className={
							isLoading
								? 'jetpack-checkout-thank-you__email-message-loading'
								: 'jetpack-checkout-thank-you__email-message'
						}
					>
						{ translate( 'We sent you an email with your receipt and further instructions.' ) }
					</p>
				) }

				{ ( isLoading || ( siteName && siteUrl ) ) && (
					<Button
						className="jetpack-checkout-thank-you__button"
						disabled={ isLoading }
						href={ siteUrl }
						primary
					>
						{ isLoading
							? translate( 'Loading' )
							: translate( 'Back to %s', {
									args: siteName,
								} ) }
					</Button>
				) }
			</Card>
		</Main>
	);
};

export default JetpackCheckoutThankYou;
