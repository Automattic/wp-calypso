import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import QueryProducts from 'calypso/components/data/query-products-list';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getHttpData, DataState, requestHttpData } from 'calypso/state/data-layer/http-data';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	isProductsListFetching as getIsProductListFetching,
	getProductName,
} from 'calypso/state/products-list/selectors';

interface Props {
	site: number | string;
	productSlug: string | 'no_product';
	isUserlessCheckoutFlow: boolean;
}

const getRequestUnauthorizedSiteId = ( siteId: string | number ): string =>
	`unauthorized-site:${ siteId }`;

const requestUnauthorizedSite = ( siteId: string | number ) =>
	requestHttpData(
		getRequestUnauthorizedSiteId( siteId ),
		http(
			{
				apiVersion: '1.2',
				method: 'GET',
				path: `/sites/${ siteId }`,
			},
			{}
		),
		{
			fromApi: () => ( data ) => {
				return [ [ getRequestUnauthorizedSiteId( siteId ), data ] ];
			},
			freshness: -Infinity,
		}
	);

const JetpackCheckoutThankYou: FunctionComponent< Props > = ( {
	site: siteFragment,
	productSlug,
	isUserlessCheckoutFlow = false,
} ) => {
	const translate = useTranslate();

	const hasProductInfo = productSlug !== 'no_product';

	const productName = useSelector( ( state ) =>
		hasProductInfo ? getProductName( state, productSlug ) : null
	) as string | null;

	const isProductListFetching = useSelector( ( state ) =>
		getIsProductListFetching( state )
	) as boolean;

	const {
		state: requestState,
		data: { name: siteName, URL: siteUrl } = { name: null, URL: null },
		// error: requestError,
	} = useSelector( () => getHttpData( getRequestUnauthorizedSiteId( siteFragment ) ) );

	const isLoading =
		! [ DataState.Success, DataState.Failure ].includes( requestState ) || isProductListFetching;

	useEffect( () => {
		requestUnauthorizedSite( siteFragment );
	}, [ siteFragment ] );

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
				{ hasProductInfo && <QueryProducts type="jetpack" /> }
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
								productName,
								siteName,
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
