import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import QueryProducts from 'calypso/components/data/query-products-list';
import Main from 'calypso/components/main';
import WordPressLogo from 'calypso/components/wordpress-logo';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import wpcom from 'calypso/lib/wp';
import { isProductsListFetching, getProductName } from 'calypso/state/products-list/selectors';
import type { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	site: number | string;
	productSlug: string | 'no_product';
	isUserlessCheckoutFlow: boolean;
}

interface Site {
	name: string;
	URL: string;
}

function useSiteQuery( siteId: string | number ) {
	return useQuery< Site >(
		[ 'unauthorized-site', siteId ],
		() => wpcom.req.get( { path: `/sites/${ siteId }`, apiVersion: '1.2' } ),
		{ meta: { persist: false } }
	);
}

const GiftThankYou: FunctionComponent< Props > = ( {
	site,
	productSlug,
	isUserlessCheckoutFlow = false,
} ) => {
	const translate = useTranslate();

	const hasProductInfo = productSlug !== 'no_product';

	const productName = useSelector( ( state ) =>
		hasProductInfo ? getProductName( state, productSlug ) : null
	);

	const productListFetching = useSelector( isProductsListFetching );

	const siteRequest = useSiteQuery( site );
	const siteName = siteRequest.data?.name;
	const siteUrl = siteRequest.data?.URL;
	const isLoading = siteRequest.isLoading || productListFetching;

	return (
		<Main className="gift-thank-you">
			<PageViewTracker
				path="/checkout/gift/thank-you/:site/:product"
				title="Checkout > Thank You"
			/>
			<Card className="gift-thank-you__card">
				{ /*className="checkout-thank-you__wordpress-logo"*/ }
				<WordPressLogo size={ 72 } />
				{ hasProductInfo && <QueryProducts /> }
				<h2 className="gift-thank-you__main-message">
					{ /* the single space literal below is intentional for rendering purposes */ }
					{ translate( 'Thank you for your purchase!' ) }{ ' ' }
					{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
				</h2>
				{ hasProductInfo && ( isLoading || ( siteName && productName ) ) && (
					<p
						className={
							isLoading ? 'gift-thank-you__sub-message-loading' : 'gift-thank-you__sub-message'
						}
					>
						{ translate( '%(productName)s was added to your site %(siteName)s.', {
							args: {
								productName,
								siteName,
							},
						} ) }
					</p>
				) }

				{ isUserlessCheckoutFlow && (
					<p
						className={
							isLoading ? 'gift-thank-you__email-message-loading' : 'gift-thank-you__email-message'
						}
					>
						{ translate( 'We sent you an email with your receipt and further instructions.' ) }
					</p>
				) }

				{ ( isLoading || ( siteName && siteUrl ) ) && (
					<Button
						className="gift-thank-you__button"
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

export default GiftThankYou;
